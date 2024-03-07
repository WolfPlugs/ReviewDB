import { components, common } from "replugged";
import ReviewComponent from "./ReviewComponent";
import ReviewsView, { ReviewsInputComponent } from "./ReviewsView";
const {
  React,
  modal: { openModal },
} = common;
const {
  Modal: {
    ModalRoot,
    ModalHeader,
    ModalContent,
    ModalFooter,
    ModalCloseButton,
  },
  Text,
  ErrorBoundary,
} = components;

function Modal({
  modalProps,
  discordId,
  name,
}: {
  modalProps: any;
  discordId: string;
  name: string;
}) {
  const [data, setData] = React.useState<Response>();
  const [signal, refetch] = React.useState(true);
  const [page, setPage] = React.useState(1);

  const ref = React.useRef<HTMLDivElement>(null);

  const reviewCount = data?.reviewCount;
  const ownReview = data?.reviews.find((r) => r.sender.discordID === Auth.user?.discordID);

  return (
    <ErrorBoundary>
      <ModalRoot {...modalProps} size={'MEDIUM'}>
        <ModalHeader>
          <Text variant="heading-lg/semibold" className={("rdb-modal-header")}>
            {name}'s Reviews
            {!!reviewCount && <span> ({reviewCount} Reviews)</span>}
          </Text>
          <ModalCloseButton onClick={modalProps.onClose} />
        </ModalHeader>

        <ModalContent scrollerRef={ref}>
          <div className={("rdb-modal-reviews")}>
            <ReviewsView
              discordId={discordId}
              name={name}
              page={page}
              refetchSignal={signal}
              onFetchReviews={setData}
              scrollToTop={() => ref.current?.scrollTo({ top: 0, behavior: "smooth" })}
              hideOwnReview
            />
          </div>
        </ModalContent>

        <ModalFooter className={("rdb-modal-footer")}>
          <div>
            {ownReview && (
              <ReviewComponent refetch={refetch} review={ownReview} profileId={discordId} />
            )}
            <ReviewsInputComponent
              isAuthor={ownReview != null}
              discordId={discordId}
              name={name}
              refetch={refetch}
            />

            {!!reviewCount && (
              <Paginator
                currentPage={page}
                maxVisiblePages={5}
                pageSize={REVIEWS_PER_PAGE}
                totalCount={reviewCount}
                onPageChange={setPage}
              />
            )}
          </div>
        </ModalFooter>
      </ModalRoot>
    </ErrorBoundary>
  );
}

export function openReviewsModal(discordId: string, name: string) {
  openModal((props) => <Modal modalProps={props} discordId={discordId} name={name} />);
}
