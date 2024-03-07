import { common, webpack, settings } from "replugged";
import { fluxDispatcher, users } from "replugged/common";
import { Review, UserType } from "./entities";
import { Auth } from "./auth";


const { showToast: toast, ToastType, ToastPosition } = webpack.getByProps(["createToast", "showToast"]);

export const defaultSettings = {};
export const reviewDBSettings = await settings.init("dev.wolfplugs.reviewdb", defaultSettings);

export function showToast(message: string, type = ToastType.MESSAGE) {

  toast({
      message,
      type,
      options: {
          position: ToastPosition.BOTTOM,
      },
  });
}

export function canDeleteReview(profileId: string, review: Review) {
  const myId = users.getCurrentUser().id;
  return (
      myId === profileId
      || review.sender.discordID === myId
      || Auth.user?.type === UserType.Admin
  );
}

export function canBlockReviewAuthor(profileId: string, review: Review) {
  const myId = users.getCurrentUser().id;
  return profileId === myId && review.sender.discordID !== myId;
}

export function canReportReview(review: Review) {
  return review.sender.discordID !== users.getCurrentUser().id;
}


export async function openUserProfileModale(userId: string) {
  await users.getUser(userId);

  await fluxDispatcher.dispatch({
    type: "USER_PROFILE_MODAL_OPEN",
    userId,
    analythicsLocation: "Bikini Bottom"
  })
}
