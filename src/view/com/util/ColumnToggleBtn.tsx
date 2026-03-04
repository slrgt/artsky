import {
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import Animated from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Svg, {Rect} from 'react-native-svg'

import {useMinimalShellFabTransform} from '#/lib/hooks/useMinimalShellTransform'
import {clamp} from '#/lib/numbers'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {IS_WEB} from '#/env'

interface ColumnToggleBtnProps {
  columns: '1' | '2' | '3'
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

function Column1Icon({size = 20}: {size?: number}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x={7} y={3} width={10} height={18} rx={1} />
    </Svg>
  )
}

function Column2Icon({size = 20}: {size?: number}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x={3} y={3} width={8} height={18} rx={1} />
      <Rect x={13} y={3} width={8} height={18} rx={1} />
    </Svg>
  )
}

function Column3Icon({size = 20}: {size?: number}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x={2} y={3} width={5} height={18} rx={1} />
      <Rect x={9.5} y={3} width={5} height={18} rx={1} />
      <Rect x={17} y={3} width={5} height={18} rx={1} />
    </Svg>
  )
}

export function ColumnToggleBtn({
  columns,
  onPress,
  style,
}: ColumnToggleBtnProps) {
  const insets = useSafeAreaInsets()
  const {gtMobile} = useBreakpoints()
  const t = useTheme()
  const fabMinimalShellTransform = useMinimalShellFabTransform()

  const size = gtMobile ? styles.sizeLarge : styles.sizeRegular

  const tabletSpacing = gtMobile
    ? {right: 170, bottom: 50}
    : {right: 90, bottom: clamp(insets.bottom, 15, 60) + 15}

  return (
    <Animated.View
      style={[
        styles.outer,
        size,
        tabletSpacing,
        !gtMobile && fabMinimalShellTransform,
      ]}>
      <Pressable accessibilityRole="button"
        onPress={onPress}
        style={[
          a.rounded_full,
          size,
          {backgroundColor: t.palette.contrast_500},
          a.align_center,
          a.justify_center,
          style,
        ]}>
        {columns === '1' ? (
          <Column1Icon size={gtMobile ? 24 : 20} />
        ) : columns === '2' ? (
          <Column2Icon size={gtMobile ? 24 : 20} />
        ) : (
          <Column3Icon size={gtMobile ? 24 : 20} />
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  sizeRegular: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sizeLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  outer: {
    // @ts-ignore web-only
    position: IS_WEB ? ('fixed' as const) : 'absolute',
    zIndex: 999,
    cursor: 'pointer',
  },
})
