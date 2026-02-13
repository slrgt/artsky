/**
 * Artsky: Floating "Hide Read Posts" button for the home feed.
 *
 * DESIGN: Modeled after LoadLatestBtn (scroll-to-top) - same positioning logic,
 * styling, and accessibility patterns. Positioned above LoadLatestBtn when both show.
 *
 * BEHAVIOR: One-time action, not a toggle. When pressed, hides all posts the user
 * has scrolled past. The button disappears after pressing (nothing left to hide).
 * Does NOT use "Hide post for me" - posts can reappear on refresh, repost, etc.
 */
import {StyleSheet} from 'react-native'
import Animated from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useMediaQuery} from 'react-responsive'

import {HITSLOP_20} from '#/lib/constants'
import {PressableScale} from '#/lib/custom-animations/PressableScale'
import {useMinimalShellFabTransform} from '#/lib/hooks/useMinimalShellTransform'
import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {clamp} from '#/lib/numbers'
import {useSession} from '#/state/session'
import {atoms as a, useLayoutBreakpoints, useTheme, web} from '#/alf'
import {useInteractionState} from '#/components/hooks/useInteractionState'
import {EyeSlash_Stroke2_Corner0_Rounded as EyeSlashIcon} from '#/components/icons/EyeSlash'
import {CENTER_COLUMN_OFFSET} from '#/components/Layout'
import {SubtleHover} from '#/components/SubtleHover'

export function HideReadPostsBtn({
  onPress,
  label,
  readCount: _readCount,
}: {
  onPress: () => void
  /** Accessibility label, e.g. "Hide 5 read posts" */
  label: string
  /** Number of read posts (for display/tooltip if needed) */
  readCount: number
}) {
  const {hasSession} = useSession()
  const {isDesktop, isTablet, isMobile, isTabletOrMobile} = useWebMediaQueries()
  const {centerColumnOffset} = useLayoutBreakpoints()
  const fabMinimalShellTransform = useMinimalShellFabTransform()
  const insets = useSafeAreaInsets()
  const t = useTheme()
  const {
    state: hovered,
    onIn: onHoverIn,
    onOut: onHoverOut,
  } = useInteractionState()

  const isTallViewport = useMediaQuery({minHeight: 700})
  const showBottomBar = hasSession ? isMobile : isTabletOrMobile

  // Position above LoadLatestBtn: LoadLatest is at bottom + 15, we add 54 for button height + gap
  const baseBottom = isTablet ? 50 : clamp(insets.bottom, 15, 60) + 15
  const bottomPosition = {bottom: baseBottom + 54}

  return (
    <Animated.View
      testID="hideReadPostsBtn"
      style={[
        a.fixed,
        a.z_20,
        {left: 18},
        isDesktop &&
          (isTallViewport ? styles.hideReadOutOfLine : styles.hideReadInline),
        isTablet &&
          (centerColumnOffset
            ? styles.hideReadInlineOffset
            : styles.hideReadInline),
        bottomPosition,
        showBottomBar && fabMinimalShellTransform,
      ]}>
      <PressableScale
        style={[
          {
            width: 42,
            height: 42,
          },
          a.rounded_full,
          a.align_center,
          a.justify_center,
          a.border,
          t.atoms.border_contrast_low,
          t.atoms.bg,
        ]}
        onPress={onPress}
        hitSlop={HITSLOP_20}
        accessibilityLabel={label}
        accessibilityHint=""
        targetScale={0.9}
        onPointerEnter={onHoverIn}
        onPointerLeave={onHoverOut}>
        <SubtleHover hover={hovered} style={[a.rounded_full]} />
        <EyeSlashIcon
          size="md"
          style={[a.z_10, t.atoms.text_contrast_medium]}
        />
      </PressableScale>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  hideReadInline: {
    left: web('calc(50vw - 282px)'),
  },
  hideReadInlineOffset: {
    left: web(`calc(50vw - 282px + ${CENTER_COLUMN_OFFSET}px)`),
  },
  hideReadOutOfLine: {
    left: web('calc(50vw - 382px)'),
  },
})
