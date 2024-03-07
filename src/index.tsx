import { Injector, Logger, webpack, components, common } from "replugged";
import ExpandableHeader from "./components/ExpandableHeader";
import { reviewDBSettings } from "./utils";
import ReviewsView from "./components/ReviewsView";
import { openReviewsModal } from "./components/ReviewModal";

const { React } = common;
const { ErrorBoundary } = components;
const inject = new Injector();

export const logger = Logger.plugin("ReviewDB");

export async function start(): Promise<void> {
  inject.after(
    webpack.getBySource("showBorder:null", { raw: true }).exports,
    "default",
    (_, res) => {
      const user = res.props.children[1].props.children[2].props.children[0].props.user;
      res.props.children[1].props.children[2].props.children.push(getReviewsComponents(user));
    },
  );
}

export function stop(): void {
  inject.uninjectAll();
}

export { Settings } from "./settings";

export function getReviewsComponents(user: any) {
  const [reviewCount, setReviewCount] = React.useState<number>();
  let dropDownState = reviewDBSettings.get("reviewsDropdownState")
  return (
    <ErrorBoundary>
      <ExpandableHeader
        headerText="User Reviews"
        onMoreClick={() => openReviewsModal(user.id, user.username)}
        moreTooltipText={
          reviewCount && reviewCount > 50 ? `View all ${reviewCount} reviews` : "Open Review Modal"
        }
        onDropDownClick={state => dropDownState = !state}
        defaultState={reviewDBSettings.get("reviewsDropdownState")}>
        <ReviewsView
          discordId={user.id}
          name={user.username}
          onFetchReviews={(r) => setReviewCount(r.reviewCount)}
          showInput
        />
      </ExpandableHeader>
    </ErrorBoundary>
  );
}
