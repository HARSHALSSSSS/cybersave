import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type StarRatingProps = {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
};

const Star = ({
  filled,
  size,
  onPress,
}: {
  filled: boolean;
  size: number;
  onPress?: () => void;
}) => (
  <Pressable onPress={onPress} disabled={!onPress} hitSlop={8}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L14.9 9.5L22 10.3L17 15.1L18.2 22.2L12 18.8L5.8 22.2L7 15.1L2 10.3L9.1 9.5L12 3Z"
        fill={filled ? '#F59E0B' : 'transparent'}
        stroke={filled ? '#F59E0B' : '#D1D5DB'}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  </Pressable>
);

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 36,
}) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        },
      }),
    [],
  );

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          filled={star <= rating}
          size={size}
          onPress={onRatingChange ? () => onRatingChange(star) : undefined}
        />
      ))}
    </View>
  );
};
