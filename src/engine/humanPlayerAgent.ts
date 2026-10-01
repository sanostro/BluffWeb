import { IPlayerAgent, PlayerAction, PlayerActionContext } from "./types";

/** Reicht die Entscheidung an die UI weiter - TS-Port von Bluff/Engine/HumanPlayerAgent.cs.
 * getAction() löst onActionRequested aus und wartet, bis die UI submitAction() aufruft. */
export class HumanPlayerAgent implements IPlayerAgent {
  private pendingResolve: ((action: PlayerAction) => void) | null = null;
  onActionRequested: ((context: PlayerActionContext) => void) | null = null;

  getAction(context: PlayerActionContext): Promise<PlayerAction> {
    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      this.onActionRequested?.(context);
    });
  }

  submitAction(action: PlayerAction): void {
    this.pendingResolve?.(action);
    this.pendingResolve = null;
  }
}
