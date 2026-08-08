/**
 * Just enough of Cloudflare's `cloudflare:email` module to type the contact
 * function. Swap this for `@cloudflare/workers-types` if the Functions
 * directory ever grows past one file.
 */
declare module "cloudflare:email" {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string);
    readonly from: string;
    readonly to: string;
    readonly raw: string;
  }
}
