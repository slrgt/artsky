import {memo, useCallback, useMemo, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {
  type AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyFeedThreadgate,
  AtUri,
  type ModerationDecision,
  RichText as RichTextAPI,
} from '@atproto/api'
import {useQueryClient} from '@tanstack/react-query'

import {useActorStatus} from '#/lib/actor-status'
import {type ReasonFeedSource} from '#/lib/api/feed/types'
import {MAX_POST_LINES} from '#/lib/constants'
import {useOpenComposer} from '#/lib/hooks/useOpenComposer'
import {usePalette} from '#/lib/hooks/usePalette'
import {makeProfileLink} from '#/lib/routes/links'
import {countLines} from '#/lib/strings/helpers'
import {
  POST_TOMBSTONE,
  type Shadow,
  usePostShadow,
} from '#/state/cache/post-shadow'
import {useFeedFeedbackContext} from '#/state/feed-feedback'
import {unstableCacheProfileView} from '#/state/queries/profile'
import {useSession} from '#/state/session'
import {useMergedThreadgateHiddenReplies} from '#/state/threadgate-hidden-replies'
import {
  buildPostSourceKey,
  setUnstablePostSource,
} from '#/state/unstable-post-source'
import {Link} from '#/view/com/util/Link'
import {PostMeta} from '#/view/com/util/PostMeta'
import {PreviewableUserAvatar} from '#/view/com/util/UserAvatar'
import {atoms as a, useTheme} from '#/alf'
import {ContentHider} from '#/components/moderation/ContentHider'
import {LabelsOnMyPost} from '#/components/moderation/LabelsOnMe'
import {PostAlerts} from '#/components/moderation/PostAlerts'
import {type AppModerationCause} from '#/components/Pills'
import {Embed} from '#/components/Post/Embed'
import {PostEmbedViewContext} from '#/components/Post/Embed/types'
import {PostRepliedTo} from '#/components/Post/PostRepliedTo'
import {ShowMoreTextButton} from '#/components/Post/ShowMoreTextButton'
import {PostControls} from '#/components/PostControls'
import {DiscoverDebug} from '#/components/PostControls/DiscoverDebug'
import {RichText} from '#/components/RichText'
import {SubtleHover} from '#/components/SubtleHover'
import {useAnalytics} from '#/analytics'
import * as bsky from '#/types/bsky'
import {PostFeedReason} from './PostFeedReason'

interface FeedItemProps {
  record: AppBskyFeedPost.Record
  reason:
    | AppBskyFeedDefs.ReasonRepost
    | AppBskyFeedDefs.ReasonPin
    | ReasonFeedSource
    | {[k: string]: unknown; $type: string}
    | undefined
  moderation: ModerationDecision
  parentAuthor: AppBskyActorDefs.ProfileViewBasic | undefined
  showReplyTo: boolean
  isThreadChild?: boolean
  isThreadLastChild?: boolean
  isThreadParent?: boolean
  feedContext: string | undefined
  reqId: string | undefined
  hideTopBorder?: boolean
  isParentBlocked?: boolean
  isParentNotFound?: boolean
  /** Artsky: When true, render as a compact preview card (for masonry layout) */
  isPreviewCard?: boolean
  /** Artsky: Card view mode - full, mini, or art only */
  cardViewMode?: 'default' | 'minimalist' | 'artOnly'
}

export function PostFeedItem({
  post,
  record,
  reason,
  feedContext,
  reqId,
  moderation,
  parentAuthor,
  showReplyTo,
  isThreadChild,
  isThreadLastChild,
  isThreadParent,
  hideTopBorder,
  isParentBlocked,
  isParentNotFound,
  rootPost,
  onShowLess,
  isRead = false,
  isPreviewCard = false,
  cardViewMode = 'default',
}: FeedItemProps & {
  post: AppBskyFeedDefs.PostView
  rootPost: AppBskyFeedDefs.PostView
  onShowLess?: (interaction: AppBskyFeedDefs.Interaction) => void
  /** Artsky: When true, post has been scrolled past (read) - shows darkened background */
  isRead?: boolean
  /** Artsky: When true, render as a compact preview card (for masonry layout) */
  isPreviewCard?: boolean
  /** Artsky: Card view mode - full, mini, or art only */
  cardViewMode?: 'default' | 'minimalist' | 'artOnly'
}): React.ReactNode {
  const postShadowed = usePostShadow(post)
  const richText = useMemo(
    () =>
      new RichTextAPI({
        text: record.text,
        facets: record.facets,
      }),
    [record],
  )
  if (postShadowed === POST_TOMBSTONE) {
    return null
  }
  if (richText && moderation) {
    return (
      <FeedItemInner
        // Safeguard from clobbering per-post state below:
        key={postShadowed.uri}
        post={postShadowed}
        record={record}
        reason={reason}
        feedContext={feedContext}
        reqId={reqId}
        richText={richText}
        parentAuthor={parentAuthor}
        showReplyTo={showReplyTo}
        moderation={moderation}
        isThreadChild={isThreadChild}
        isThreadLastChild={isThreadLastChild}
        isThreadParent={isThreadParent}
        hideTopBorder={hideTopBorder}
        isParentBlocked={isParentBlocked}
        isParentNotFound={isParentNotFound}
        rootPost={rootPost}
        onShowLess={onShowLess}
        isRead={isRead}
        isPreviewCard={isPreviewCard}
        cardViewMode={cardViewMode}
      />
    )
  }
  return null
}

let FeedItemInner = ({
  post,
  record,
  reason,
  feedContext,
  reqId,
  richText,
  moderation,
  parentAuthor,
  showReplyTo,
  isThreadChild,
  isThreadLastChild,
  isThreadParent,
  hideTopBorder,
  isParentBlocked,
  isParentNotFound,
  rootPost,
  onShowLess,
  isRead = false,
  isPreviewCard = false,
  cardViewMode = 'default',
}: FeedItemProps & {
  richText: RichTextAPI
  post: Shadow<AppBskyFeedDefs.PostView>
  rootPost: AppBskyFeedDefs.PostView
  onShowLess?: (interaction: AppBskyFeedDefs.Interaction) => void
  isRead?: boolean
  isPreviewCard?: boolean
  cardViewMode?: 'default' | 'minimalist' | 'artOnly'
}): React.ReactNode => {
  const ax = useAnalytics()
  const queryClient = useQueryClient()
  const {openComposer} = useOpenComposer()
  const pal = usePalette('default')
  const t = useTheme()

  const [hover, setHover] = useState(false)

  const [href] = useMemo(() => {
    const urip = new AtUri(post.uri)
    return [makeProfileLink(post.author, 'post', urip.rkey), urip.rkey]
  }, [post.uri, post.author])
  const {sendInteraction, feedSourceInfo, feedDescriptor} =
    useFeedFeedbackContext()

  const onPressReply = () => {
    sendInteraction({
      item: post.uri,
      event: 'app.bsky.feed.defs#interactionReply',
      feedContext,
      reqId,
    })
    openComposer({
      replyTo: {
        uri: post.uri,
        cid: post.cid,
        text: record.text || '',
        author: post.author,
        embed: post.embed,
        moderation,
        langs: record.langs,
      },
      logContext: 'PostReply',
    })
  }

  const onOpenAuthor = () => {
    sendInteraction({
      item: post.uri,
      event: 'app.bsky.feed.defs#clickthroughAuthor',
      feedContext,
      reqId,
    })
    ax.metric('post:clickthroughAuthor', {
      uri: post.uri,
      authorDid: post.author.did,
      logContext: 'FeedItem',
      feedDescriptor,
    })
  }

  const onOpenReposter = () => {
    sendInteraction({
      item: post.uri,
      event: 'app.bsky.feed.defs#clickthroughReposter',
      feedContext,
      reqId,
    })
  }

  const onOpenEmbed = () => {
    sendInteraction({
      item: post.uri,
      event: 'app.bsky.feed.defs#clickthroughEmbed',
      feedContext,
      reqId,
    })
    ax.metric('post:clickthroughEmbed', {
      uri: post.uri,
      authorDid: post.author.did,
      logContext: 'FeedItem',
      feedDescriptor,
    })
  }

  const onBeforePress = () => {
    sendInteraction({
      item: post.uri,
      event: 'app.bsky.feed.defs#clickthroughItem',
      feedContext,
      reqId,
    })
    ax.metric('post:clickthroughItem', {
      uri: post.uri,
      authorDid: post.author.did,
      logContext: 'FeedItem',
      feedDescriptor,
    })
    unstableCacheProfileView(queryClient, post.author)
    setUnstablePostSource(buildPostSourceKey(post.uri, post.author.handle), {
      feedSourceInfo,
      post: {
        post,
        reason: AppBskyFeedDefs.isReasonRepost(reason) ? reason : undefined,
        feedContext,
        reqId,
      },
    })
  }

  const outerStyles = [
    styles.outer,
    isPreviewCard ? styles.outerPreviewCard : undefined,
    {
      borderColor: pal.colors.border,
      paddingBottom:
        isThreadLastChild || (!isThreadChild && !isThreadParent)
          ? isPreviewCard
            ? 4
            : 8
          : undefined,
      // Artsky: In preview card mode, use borders for separation instead of top border
      borderTopWidth:
        hideTopBorder || isThreadChild || isPreviewCard
          ? 0
          : StyleSheet.hairlineWidth,
      // Artsky: Darken background when post has been read (scrolled past)
      ...(isRead && {backgroundColor: t.palette.contrast_50}),
      // Artsky: Preview card mode - add border for card-like appearance
      ...(isPreviewCard && {
        borderWidth: 1,
        borderRadius: 12,
        marginHorizontal: 4,
        marginVertical: 4,
        paddingHorizontal: isPreviewCard ? 8 : undefined,
        paddingVertical: isPreviewCard ? 8 : undefined,
        // Artsky: Prevent vertical collapsing in masonry layout
        minHeight: 150, // Minimum height to prevent squishing (increased from 100)
        flexShrink: 0, // Prevent flexbox from shrinking this item
      }),
    },
  ]

  // Artsky: Smaller avatar in preview card mode
  const avatarSize = isPreviewCard ? 32 : 42

  /**
   * If `post[0]` in this slice is the actual root post (not an orphan thread),
   * then we may have a threadgate record to reference
   */
  const threadgateRecord = bsky.dangerousIsType<AppBskyFeedThreadgate.Record>(
    rootPost.threadgate?.record,
    AppBskyFeedThreadgate.isRecord,
  )
    ? rootPost.threadgate.record
    : undefined

  const {isActive: live} = useActorStatus(post.author)

  const viaRepost = useMemo(() => {
    if (AppBskyFeedDefs.isReasonRepost(reason) && reason.uri && reason.cid) {
      return {
        uri: reason.uri,
        cid: reason.cid,
      }
    }
  }, [reason])

  return (
    <Link
      testID={`feedItem-by-${post.author.handle}`}
      style={outerStyles}
      href={href}
      noFeedback
      accessible={false}
      onBeforePress={onBeforePress}
      dataSet={{feedContext}}
      onPointerEnter={() => {
        setHover(true)
      }}
      onPointerLeave={() => {
        setHover(false)
      }}>
      <SubtleHover hover={hover} />
      <View style={{flexDirection: 'row', gap: 10, paddingLeft: 8}}>
        <View style={{width: 42}}>
          {isThreadChild && (
            <View
              style={[
                styles.replyLine,
                {
                  flexGrow: 1,
                  backgroundColor: pal.colors.replyLine,
                  marginBottom: 4,
                },
              ]}
            />
          )}
        </View>

        <View style={[a.pt_sm, a.flex_shrink]}>
          {reason && cardViewMode !== 'artOnly' && (
            <PostFeedReason
              reason={reason}
              moderation={moderation}
              onOpenReposter={onOpenReposter}
            />
          )}
        </View>
      </View>

      <View style={styles.layout}>
        {/* Artsky: Hide avatar in artOnly mode */}
        {cardViewMode !== 'artOnly' && (
          <View
            style={isPreviewCard ? styles.layoutAviPreview : styles.layoutAvi}>
            <PreviewableUserAvatar
              size={avatarSize}
              profile={post.author}
              moderation={moderation.ui('avatar')}
              type={post.author.associated?.labeler ? 'labeler' : 'user'}
              onBeforePress={onOpenAuthor}
              live={live}
            />
            {isThreadParent && (
              <View
                style={[
                  styles.replyLine,
                  {
                    flexGrow: 1,
                    backgroundColor: pal.colors.replyLine,
                    marginTop: live ? 8 : 4,
                  },
                ]}
              />
            )}
          </View>
        )}
        <View
          style={
            isPreviewCard ? styles.layoutContentPreview : styles.layoutContent
          }>
          {/* Artsky: Hide author info in artOnly mode */}
          {cardViewMode !== 'artOnly' && (
            <PostMeta
              author={post.author}
              moderation={moderation}
              timestamp={post.indexedAt}
              postHref={href}
              onOpenAuthor={onOpenAuthor}
            />
          )}
          {/* Artsky: Hide author info in artOnly mode */}
          {cardViewMode !== 'artOnly' && (
            <>
              {showReplyTo &&
                (parentAuthor || isParentBlocked || isParentNotFound) && (
                  <PostRepliedTo
                    parentAuthor={parentAuthor}
                    isParentBlocked={isParentBlocked}
                    isParentNotFound={isParentNotFound}
                  />
                )}
              <LabelsOnMyPost post={post} />
            </>
          )}
          {/* Artsky: Show text content only in default mode, hide in minimalist/artOnly */}
          {cardViewMode === 'default' && (
            <PostContent
              moderation={moderation}
              richText={richText}
              postEmbed={post.embed}
              postAuthor={post.author}
              onOpenEmbed={onOpenEmbed}
              post={post}
              threadgateRecord={threadgateRecord}
            />
          )}
          {/* Artsky: Show actions in default/minimalist modes, hide in artOnly */}
          {cardViewMode !== 'artOnly' && (
            <PostControls
              post={post}
              record={record}
              richText={richText}
              onPressReply={onPressReply}
              logContext="FeedItem"
              feedContext={feedContext}
              reqId={reqId}
              threadgateRecord={threadgateRecord}
              onShowLess={onShowLess}
              viaRepost={viaRepost}
            />
          )}
        </View>

        <DiscoverDebug feedContext={feedContext} />
      </View>
    </Link>
  )
}
FeedItemInner = memo(FeedItemInner)

let PostContent = ({
  post,
  moderation,
  richText,
  postEmbed,
  postAuthor,
  onOpenEmbed,
  threadgateRecord,
}: {
  moderation: ModerationDecision
  richText: RichTextAPI
  postEmbed: AppBskyFeedDefs.PostView['embed']
  postAuthor: AppBskyFeedDefs.PostView['author']
  onOpenEmbed: () => void
  post: AppBskyFeedDefs.PostView
  threadgateRecord?: AppBskyFeedThreadgate.Record
}): React.ReactNode => {
  const {currentAccount} = useSession()
  const [limitLines, setLimitLines] = useState(
    () => countLines(richText.text) >= MAX_POST_LINES,
  )
  const threadgateHiddenReplies = useMergedThreadgateHiddenReplies({
    threadgateRecord,
  })
  const additionalPostAlerts: AppModerationCause[] = useMemo(() => {
    const isPostHiddenByThreadgate = threadgateHiddenReplies.has(post.uri)
    const rootPostUri = bsky.dangerousIsType<AppBskyFeedPost.Record>(
      post.record,
      AppBskyFeedPost.isRecord,
    )
      ? post.record?.reply?.root?.uri || post.uri
      : undefined
    const isControlledByViewer =
      rootPostUri && new AtUri(rootPostUri).host === currentAccount?.did
    return isControlledByViewer && isPostHiddenByThreadgate
      ? [
          {
            type: 'reply-hidden',
            source: {type: 'user', did: currentAccount?.did},
            priority: 6,
          },
        ]
      : []
  }, [post, currentAccount?.did, threadgateHiddenReplies])

  const onPressShowMore = useCallback(() => {
    setLimitLines(false)
  }, [setLimitLines])

  return (
    <ContentHider
      testID="contentHider-post"
      modui={moderation.ui('contentList')}
      ignoreMute
      childContainerStyle={styles.contentHiderChild}>
      <PostAlerts
        modui={moderation.ui('contentList')}
        style={[a.pb_xs]}
        additionalCauses={additionalPostAlerts}
      />
      {richText.text ? (
        <View style={[a.mb_2xs]}>
          <RichText
            enableTags
            testID="postText"
            value={richText}
            numberOfLines={limitLines ? MAX_POST_LINES : undefined}
            style={[a.flex_1, a.text_md]}
            authorHandle={postAuthor.handle}
            shouldProxyLinks={true}
          />
          {limitLines && (
            <ShowMoreTextButton style={[a.text_md]} onPress={onPressShowMore} />
          )}
        </View>
      ) : undefined}
      {postEmbed ? (
        <View style={[a.pb_xs]}>
          <Embed
            embed={postEmbed}
            moderation={moderation}
            onOpen={onOpenEmbed}
            viewContext={PostEmbedViewContext.Feed}
          />
        </View>
      ) : null}
    </ContentHider>
  )
}
PostContent = memo(PostContent)

const styles = StyleSheet.create({
  outer: {
    paddingLeft: 10,
    paddingRight: 15,
    cursor: 'pointer',
  },
  outerPreviewCard: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    // Artsky: In masonry layout, posts should take full column width
    width: '100%',
    // Artsky: Prevent posts from becoming tiny when new posts load
    minWidth: '100%',
    flexShrink: 0,
  },
  replyLine: {
    width: 2,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  layout: {
    flexDirection: 'row',
    marginTop: 1,
  },
  layoutAvi: {
    paddingLeft: 8,
    paddingRight: 10,
    position: 'relative',
    zIndex: 999,
  },
  layoutAviPreview: {
    paddingLeft: 4,
    paddingRight: 6,
    position: 'relative',
    zIndex: 999,
  },
  layoutContent: {
    position: 'relative',
    flex: 1,
    zIndex: 0,
  },
  layoutContentPreview: {
    position: 'relative',
    flex: 1,
    zIndex: 0,
    marginLeft: 4,
  },
  alert: {
    marginTop: 6,
    marginBottom: 6,
  },
  contentHiderChild: {
    marginTop: 6,
  },
  embed: {
    marginBottom: 6,
  },
  translateLink: {
    marginBottom: 6,
  },
})
