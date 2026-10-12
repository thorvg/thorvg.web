// TEMPORARY: CodeFactor lint probe. Do not merge.
import { LitElement } from 'lit';

export const l01 = "double"; // L01 quotes

export function l02(value: number): boolean {
  console.log(value); // L02 no-console
  return value == 1; // L03 eqeqeq
}

export class LintProbeElement extends LitElement {
  constructor() {
    super();
    this.setAttribute('probe', '1'); // L04 wc/no-constructor-attributes
  }

  override connectedCallback(): void {
    super.connectedCallback(); // L05 wc/guard-super-call
  }
}
