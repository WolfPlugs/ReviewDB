import { webpack } from "replugged";
import { React, users } from "replugged/common";
import { FormText } from "replugged/components";
import { reviewDBSettings } from "../utils";
import { REVIEWS_PER_PAGE, getReviews } from "../reviewDBApi";
import ReviewComponent from "./ReviewComponent";
import { Auth } from "../auth";


const { Editor, Transforms } = webpack.getByProps("Editor", "Transforms"); 
const { ChatInputTypes } = webpack.getByProps("ChatInputTypes");
const { createChannelRecordFromServer } = webpack.getByProps("createChannelRecordFromServer");
const InputComponent = webpack.getBySource('default.CHANNEL_TEXT_AREA')
const RelationshipStore = webpack.getByStoreName('RelationshipStore');


interface UserProps {
  discordId: string;
  name: string;
}


interface Props extends UserProps {
  onFetchReviews(data: Response): void;
  refetchSignal?: unknown;
  showInput?: boolean;
  page?: number;
  scrollToTop?(): void;
  hideOwnReview?: boolean;
}


export default function ReviewsView({
  discordId,
  name,
  onFetchReviews,
  refetchSignal,
  scrollToTop,
  page = 1,
  showInput = false,
  hideOwnReview = false,
}: Props) {
  const [reviewData, setReviewData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getReviews(discordId, (page - 1) * REVIEWS_PER_PAGE);
      if (reviewDBSettings.get("hideBlockedUsers")) {
        data.reviews = data.reviews.filter(
          (r) => !RelationshipStore.isBlocked(r.sender.discordID)
        );
      }
      setReviewData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [refetchSignal, page]);

  const refetch = () => {
    // Trigger a refetch of data
    fetchData();
  };

  if (loading) return <div>Loading...</div>;
  if (!reviewData) return null;

  return (
      <>
          <ReviewList
              refetch={refetch}
              reviews={reviewData!.reviews}
              hideOwnReview={hideOwnReview}
              profileId={discordId}
          />

          {showInput && (
              <ReviewsInputComponent
                  name={name}
                  discordId={discordId}
                  refetch={refetch}
                  isAuthor={reviewData!.reviews?.some(r => r.sender.discordID === users.getCurrentUser().id)}
              />
          )}
      </>
  );
}

function ReviewList({ refetch, reviews, hideOwnReview, profileId }: { refetch(): void; reviews: Review[]; hideOwnReview: boolean; profileId: string; }) {
  const myId = users.getCurrentUser().id;

  return (
      <div className={("rdb-view")}>
          {reviews?.map(review =>
              (review.sender.discordID !== myId || !hideOwnReview) &&
              <ReviewComponent
                  key={review.id}
                  review={review}
                  refetch={refetch}
                  profileId={profileId}
              />
          )}

          {reviews?.length === 0 && (
              <FormText className={("rdb-placeholder")}>
                  Looks like nobody reviewed this user yet. You could be the first!
              </FormText>
          )}
      </div>
  );
}

export function ReviewsInputComponent({ discordId, isAuthor, refetch, name }: { discordId: string, name: string; isAuthor: boolean; refetch(): void; }) {
  const { token } = Auth;
  const editorRef = React.useRef<any>(null);
  const inputType = ChatInputTypes.FORM;
  inputType.disableAutoFocus = true;

  const channel = createChannelRecordFromServer({ id: "0", type: 1 });

  return (
      <>
          <div onClick={() => {
              if (!token) {
                  showToast("Opening authorization window...");
                  authorize();
              }
          }}>
              <InputComponent
                  className={("rdb-input")}
                  channel={channel}
                  placeholder={
                      !token
                          ? "You need to authorize to review users!"
                          : isAuthor
                              ? `Update review for @${name}`
                              : `Review @${name}`
                  }
                  type={inputType}
                  disableThemedBackground={true}
                  setEditorRef={ref => editorRef.current = ref}
                  textValue=""
                  onSubmit={
                      async res => {
                          const response = await addReview({
                              userid: discordId,
                              comment: res.value,
                          });

                          if (response) {
                              refetch();

                              const slateEditor = editorRef.current.ref.current.getSlateEditor();

                              // clear editor
                              Transforms.delete(slateEditor, {
                                  at: {
                                      anchor: Editor.start(slateEditor, []),
                                      focus: Editor.end(slateEditor, []),
                                  }
                              });
                          }

                          // even tho we need to return this, it doesnt do anything
                          return {
                              shouldClear: false,
                              shouldRefocus: true,
                          };
                      }
                  }
              />
          </div>

      </>
  );
}
