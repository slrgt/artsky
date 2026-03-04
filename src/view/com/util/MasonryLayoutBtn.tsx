import {
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import Animated from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Svg, {Line, Rect} from 'react-native-svg'

import {useMinimalShellFabTransform} from '#/lib/hooks/useMinimalShellTransform'
import {clamp} from '#/lib/numbers'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {IS_WEB} from '#/env'

interface MasonryLayoutBtnProps {
  isMasonry: boolean
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

function TwitterIcon({size = 20}: {size?: number}) {
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
      <Rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    </Svg>
  )
}

function PinterestIcon({size = 20}: {size?: number}) {
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
      <Rect x={3} y={3} width={9} height={18} rx={2} ry={2} />
      <Rect x={12} y={3} width={9} height={12} rx={2} ry={2} />
      <Line x1={3} y1={15} x2={21} y2={15} strokeDasharray="2 2" />
    </Svg>
  )
}

export function MasonryLayoutBtn({
  isMasonry,
  onPress,
  style,
}: MasonryLayoutBtnProps) {
  const insets = useSafeAreaInsets()
  const {gtMobile} = useBreakpoints()
  const t = useTheme()
  const fabMinimalShellTransform = useMinimalShellFabTransform()

  const size = gtMobile ? styles.sizeLarge : styles.sizeRegular

  const tabletSpacing = gtMobile
    ? {right: 290, bottom: 50}
    : {right: 190, bottom: clamp(insets.bottom, 15, 60) + 15}

  return (
    <Animated.View
      style={[
        styles.outer,
        size,
        tabletSpacing,
        !gtMobile && fabMinimalShellTransform,
      ]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[
          a.rounded_full,
          size,
          {backgroundColor: t.palette.contrast_500},
          a.align_center,
          a.justify_center,
          style,
        ]}>
        {isMasonry ? (
          <PinterestIcon size={gtMobile ? 24 : 20} />
        ) : (
          <TwitterIcon size={gtMobile ? 24 : 20} />
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
