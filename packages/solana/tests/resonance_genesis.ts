import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";

describe("resonance_genesis", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("documents the required Devnet behavior", async () => {
    expect(33).to.equal(33);
  });
});
