import { CommonActions } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainTabParamList, ServicesStackParamList } from '@/types/navigation';
import type {
  MainServiceCatalogItem,
  SubServiceCatalogItem,
} from '@services/api/services.api';

type SubServiceNavInput = Pick<
  SubServiceCatalogItem,
  'id' | 'displayName' | 'requiresStateSelection' | 'availableStates'
>;

/** Ordered slug hints — first match wins; never match only on main category slug. */
export const QUICK_ACTION_SLUG_HINTS: Record<string, string[]> = {
  aadhaar: ['aadhaar-update', 'aadhaar'],
  pan: ['pan-card', 'pan'],
  certificates: [
    'income-certificate',
    'birth-certificate',
    'caste-certificate',
    'domicile-certificate',
    'certificate',
  ],
};

export function findSubServiceInCatalog(
  catalog: MainServiceCatalogItem[],
  categoryId: string,
  optionId: string,
): SubServiceCatalogItem | undefined {
  const main = catalog.find(item => item.id === categoryId);
  return main?.subServices.find(sub => sub.id === optionId);
}

export function findSubServiceBySlugHints(
  catalog: MainServiceCatalogItem[],
  hints: string[],
): { categoryId: string; subService: SubServiceCatalogItem } | null {
  for (const hint of hints) {
    for (const main of catalog) {
      const sub = main.subServices.find(item => item.slug.includes(hint));
      if (sub) {
        return { categoryId: main.id, subService: sub };
      }
    }
  }
  return null;
}

export function resolveServiceDestination(
  subService: SubServiceNavInput,
  categoryId: string,
  existing?: { stateCode?: string; stateName?: string },
): {
  screen: 'ServiceDetail' | 'StateSelect';
  params:
    | ServicesStackParamList['ServiceDetail']
    | ServicesStackParamList['StateSelect'];
} {
  const { stateCode, stateName } = existing ?? {};

  if (!subService.requiresStateSelection) {
    return {
      screen: 'ServiceDetail',
      params: { categoryId, optionId: subService.id },
    };
  }

  if (stateCode) {
    return {
      screen: 'ServiceDetail',
      params: {
        categoryId,
        optionId: subService.id,
        stateCode,
        stateName,
      },
    };
  }

  const states = subService.availableStates ?? [];
  if (states.length === 1) {
    return {
      screen: 'ServiceDetail',
      params: {
        categoryId,
        optionId: subService.id,
        stateCode: states[0].code,
        stateName: states[0].name,
      },
    };
  }

  return {
    screen: 'StateSelect',
    params: {
      categoryId,
      optionId: subService.id,
      optionName: subService.displayName,
    },
  };
}

/** Reset Services stack to [ServicesMain → target] so back and tab switches behave predictably. */
function dispatchServicesStack(
  tabNavigation: BottomTabNavigationProp<MainTabParamList>,
  screen: keyof ServicesStackParamList,
  params: ServicesStackParamList[keyof ServicesStackParamList],
) {
  tabNavigation.dispatch(
    CommonActions.navigate({
      name: 'ServicesTab',
      params: {
        state: {
          routes: [{ name: 'ServicesMain' }, { name: screen, params }],
          index: 1,
        },
      },
    }),
  );
}

export function navigateToSubServiceFromStack(
  navigation: NativeStackNavigationProp<ServicesStackParamList>,
  categoryId: string,
  subService: SubServiceNavInput,
  existing?: { stateCode?: string; stateName?: string },
) {
  const { screen, params } = resolveServiceDestination(
    subService,
    categoryId,
    existing,
  );
  navigation.navigate(screen, params as never);
}

export function navigateToSubServiceFromTab(
  tabNavigation: BottomTabNavigationProp<MainTabParamList> | undefined,
  categoryId: string,
  subService: SubServiceNavInput,
  existing?: { stateCode?: string; stateName?: string },
) {
  if (!tabNavigation) return;
  const { screen, params } = resolveServiceDestination(
    subService,
    categoryId,
    existing,
  );
  dispatchServicesStack(tabNavigation, screen, params);
}

export function navigateToSubServiceById(
  tabNavigation: BottomTabNavigationProp<MainTabParamList> | undefined,
  catalog: MainServiceCatalogItem[],
  categoryId: string,
  optionId: string,
  existing?: { stateCode?: string; stateName?: string },
) {
  const subService = findSubServiceInCatalog(catalog, categoryId, optionId);
  if (!subService) {
    tabNavigation?.dispatch(
      CommonActions.navigate({
        name: 'ServicesTab',
        params: {
          state: {
            routes: [
              { name: 'ServicesMain' },
              {
                name: 'ServiceDetail',
                params: { categoryId, optionId },
              },
            ],
            index: 1,
          },
        },
      }),
    );
    return;
  }
  navigateToSubServiceFromTab(tabNavigation, categoryId, subService, existing);
}

export function goBackInServicesStack(
  navigation: NativeStackNavigationProp<ServicesStackParamList>,
) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  navigation.navigate('ServicesMain');
}
