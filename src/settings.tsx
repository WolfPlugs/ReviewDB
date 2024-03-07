import { ButtonItem, SwitchItem } from "replugged/components";

export function Settings() {
  return (
    <div>
      <ButtonItem
        {...{
          button: "Authorize with ReviewDB",
          onClick: () => {
            window.location.reload();
          },
        }}>
        Authorize with ReviewDB to be able to review users.
      </ButtonItem>
      <SwitchItem>

      </SwitchItem>
    </div>
  );
}
