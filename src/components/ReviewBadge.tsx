import { React } from "replugged/common";
import { Badge } from "../entities";
import { Tooltip } from "replugged/components";
import MaskedLink from "../MaskedLinked";

export default function ReviewBadge(badge: Badge & { onClick?(): void; }) {
  const Wrapper = ({ badge, ...props }) => {
    if (badge.redirectURL) {
        return <a href={badge.redirectURL} {...props} />;
    } else {
        return <span {...props} role="button" />;
    }
};

  return (
      <Tooltip
          text={badge.name}>
          {({ onMouseEnter, onMouseLeave }) => (
              <Wrapper className={("rdb-blocked-badge")} href={badge.redirectURL!} onClick={badge.onClick}>
                  <img
                      className={("rdb-badge")}
                      width="22px"
                      height="22px"
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave}
                      src={badge.icon}
                      alt={badge.description}
                  />
              </Wrapper>
          )}
      </Tooltip>
  );
}
