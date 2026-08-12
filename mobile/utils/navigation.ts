import { CommonActions, NavigationProp, ParamListBase } from '@react-navigation/native';

export const resetToMain = (navigation: NavigationProp<ParamListBase>) => {
  const parent = navigation.getParent();
  const target = parent ?? navigation;
  target.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    }),
  );
};

export const resetToAuth = (navigation: NavigationProp<ParamListBase>) => {
  const root = navigation.getParent()?.getParent();
  root?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    }),
  );
};
