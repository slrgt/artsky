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
import {type LayoutMode} from '#/state/preferences/layout-mode'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {IS_WEB} from '#/env'

interface LayoutModeBtnProps {
  layoutMode: LayoutMode
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
      <Rect x={7} y={3} width={10} height={18} rx={1} />
      <Line x1={7} y1={9} x2={17} y2={9} />
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
      {/* Masonry/Pinterest-style layout with staggered cards */}
      <Rect x={2} y={3} width={6} height={8} rx={1} />
      <Rect x={2} y={13} width={6} height={8} rx={1} />
      <Rect x={9} y={3} width={6} height={12} rx={1} />
      <Rect x={16} y={3} width={6} height={6} rx={1} />
      <Rect x={16} y={11} width={6} height={10} rx={1} />
    </Svg>
  )
}

export function LayoutModeBtn({
  layoutMode,
  onPress,
  style,
}: LayoutModeBtnProps) {
  const insets = useSafeAreaInsets()
  const {gtMobile} = useBreakpoints()
  const t = useTheme()
  const fabMinimalShellTransform = useMinimalShellFabTransform()

  const size = gtMobile ? styles.sizeLarge : styles.sizeRegular

  // Primary layout toggle - position prominently
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          layoutMode === 'twitter'
            ? 'Switch to Pinterest layout'
            : 'Switch to Twitter layout'
        }
        onPress={onPress}
        style={[
          a.rounded_full,
          size,
          {backgroundColor: t.palette.contrast_500},
          a.align_center,
          a.justify_center,
          style,
        ]}>
        {layoutMode === 'twitter' ? (
          <TwitterIcon size={gtMobile ? 24 : 20} />
        ) : (
          <PinterestIcon size={gtMobile ? 24 : 20} />
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
