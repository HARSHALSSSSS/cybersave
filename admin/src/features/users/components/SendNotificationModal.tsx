import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import {
  NOTIFICATION_MESSAGE_MAX_LENGTH,
  sendNotificationSchema,
  type SendNotificationFormValues,
} from '../schemas/notification.schema';
import { sendCitizenNotification } from '../services/users.service';
import type { Citizen } from '../types';

interface SendNotificationModalProps {
  citizen: Pick<Citizen, 'id' | 'fullName' | 'initials'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationModal({ citizen, open, onOpenChange }: SendNotificationModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: { type: 'email', subject: '', message: '' },
  });

  const message = watch('message') ?? '';

  const { mutateAsync } = useMutation({
    mutationFn: (values: SendNotificationFormValues) =>
      sendCitizenNotification({ citizenId: citizen.id, ...values }),
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutateAsync(values);
    toast.success(`Notification sent to ${citizen.fullName}`);
    reset();
    onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
              <Bell className="h-4.5 w-4.5" />
            </span>
            <DialogTitle className="text-base font-semibold text-gray-900">Send Notification</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Send a notification to {citizen.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-sm font-semibold text-[#2563EB]">
              {citizen.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{citizen.fullName}</p>
            <p className="text-xs text-gray-500">{citizen.id}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notification-type">Notification Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="notification-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject Line</Label>
            <Input id="subject" placeholder="Enter subject" {...register('subject')} />
            {errors.subject ? <p className="text-xs text-red-600">{errors.subject.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message Body</Label>
              <span className="text-xs text-gray-400">
                {message.length}/{NOTIFICATION_MESSAGE_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="message"
              rows={5}
              maxLength={NOTIFICATION_MESSAGE_MAX_LENGTH}
              placeholder="Write your message..."
              {...register('message')}
            />
            {errors.message ? <p className="text-xs text-red-600">{errors.message.message}</p> : null}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2563EB] hover:bg-blue-700">
              {isSubmitting ? 'Sending…' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
