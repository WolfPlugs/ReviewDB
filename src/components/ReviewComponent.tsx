import { Parser, React, parser } from "replugged/common";
import { canBlockReviewAuthor, canDeleteReview, canReportReview, openUserProfileModale, reviewDBSettings, showToast } from "../utils";
import { unblockUser } from "../reviewDBApi";
import { Review, ReviewType } from "../entities";
import { Auth } from "../auth";
import { webpack } from "replugged";
import { BlockButton, DeleteButton, ReportButton } from "./MessageButton";
import ReviewBadge from "./ReviewBadge";

const { cozyMessage, buttons, message, buttonsInner, groupStart } = webpack.getByProps("cozyMessage")
const { container, isHeader } = webpack.getByProps("container", "isHeader")
const { avatar, clickable, username, wrapper, cozy } = webpack.getByProps("avatar", "zalgo")
const buttonClasses = webpack.getByProps("button", "wrapper", "selected")
const botTag = webpack.getByProps("botTag", "botTagRegular")

export default function ReviewComponent({
    review,
    refetch,
    profileId,
  }: {
    review: Review;
    refetch(): void;
    profileId: string;
  }) {
    const [showAll, setShowAll] = React.useState(false);

    function openModal() {
      openUserProfileModale(review.sender.discordID);
    }

    function delReview() {
      showToast({});
    }


    function reportRev() {
      showToast({})
    }


    const isAuthorBlocked = Auth?.user?.blockedUsers?.includes(review.sender.discordID) ?? false;
    
    function blockReviewSender() {
      if (isAuthorBlocked) return unblockUser(review.sender.discordID);

      showToast({});
    }


    return (
      <div className={`rdb-review ${cozyMessage} ${wrapper} ${message} ${groupStart} ${cozy}`} style={
        {
            marginLeft: "0px",
            paddingLeft: "52px",
        }
    }>

        <img
            className={`${avatar} ${clickable}`}
            onClick={openModal}
            src={review.sender.profilePhoto || "/assets/1f0bfc0865d324c2587920a7d80c609b.png?size=128"}
            style={{ left: "0px", zIndex: 0 }}
        />
        <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
            <span
                className={`${clickable} ${username}`}
                style={{ color: "var(--channels-default)", fontSize: "14px" }}
                onClick={() => openModal()}
            >
                {review.sender.username}
            </span>

            {review.type === ReviewType.System && (
                <span
                    className={`${botTag.botTagVerified} ${botTag.botTagRegular} ${botTag.botTag} ${botTag.px} ${botTag.rem}`}
                    style={{ marginLeft: "4px" }}>
                    <span className={botTag.botText}>
                        System
                    </span>
                </span>
            )}
        </div>
        {isAuthorBlocked && (
            <ReviewBadge
                name="You have blocked this user"
                description="You have blocked this user"
                icon="/assets/aaee57e0090991557b66.svg"
                type={0}
                onClick={() => openBlockModal()}
            />
        )}
        {review.sender.badges.map(badge => <ReviewBadge {...badge} />)}

        {/* {
            !reviewDBSettings.get("hideTimestamps") && review.type !== ReviewType.System && (
                <Timestamp timestamp={new Date(review.timestamp * 1000)} >
                    {dateFormat.format(review.timestamp * 1000)}
                </Timestamp>
                )
        } */}

        <div className={("rdb-review-comment")}>
            {(review.comment.length > 200 && !showAll)
                ? [parser.parseGuildEventDescription(review.comment.substring(0, 200)), "...", <br />, (<a onClick={() => setShowAll(true)}>Read more</a>)]
                : parser.parseGuildEventDescription(review.comment)}
        </div>

        {review.id !== 0 && (
            <div className={`${container} ${isHeader} ${buttons}`} style={{
                padding: "0px",
            }}>
                <div className={`${buttonClasses.wrapper} ${buttonsInner}`} >
                    {canReportReview(review) && <ReportButton onClick={reportRev} />}
                    {canBlockReviewAuthor(profileId, review) && <BlockButton isBlocked={isAuthorBlocked} onClick={blockReviewSender} />}
                    {canDeleteReview(profileId, review) && <DeleteButton onClick={delReview} />}
                </div>
            </div>
        )}
    </div>
    )
  }

