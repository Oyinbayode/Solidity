import React from "react";
import { ConnectButton } from "@web3uikit/web3";

const Nav = () => {
  return (
    <div>
      <ConnectButton moralisAuth={false} />
    </div>
  );
};

export default Nav;
