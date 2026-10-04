// SPDX-License-Identifier: MIT
import type { StarMilestone } from "./milestone-card";

export interface CertificateData {
  fullName: string;
  milestone: StarMilestone;
  starsCount: number;
  growth7d: number | null;
  issuedOn: string;
}

function xml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] ?? character
  );
}

/** Standalone, image-safe SVG sized for social sharing and local download. */
export function renderCertificate(data: CertificateData): string {
  const repo = xml(data.fullName.length > 48 ? `${data.fullName.slice(0, 45)}…` : data.fullName);
  const title = xml(
    `${data.fullName} reached ${data.milestone.toLocaleString("en-US")} GitHub stars`
  );
  const momentum =
    data.growth7d === null
      ? "Recent velocity unavailable"
      : `+${data.growth7d.toLocaleString("en-US")} in 7 days`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
<title id="title">${title}</title><desc id="description">Current star count: ${data.starsCount.toLocaleString("en-US")}. ${xml(momentum)}.</desc>
<rect width="1200" height="630" fill="#161c1b"/>
<path d="M0 0h1200v630H0z" fill="none" stroke="#d9c99c" stroke-width="20"/>
<path d="M48 48h1104v534H48z" fill="none" stroke="#655e49" stroke-width="1"/>
<circle cx="1000" cy="310" r="218" fill="none" stroke="#605a47" stroke-width="1"/>
<circle cx="1000" cy="310" r="178" fill="none" stroke="#605a47" stroke-width="1"/>
<circle cx="1000" cy="310" r="140" fill="#202823" stroke="#d9c99c" stroke-width="2"/>
<text x="1000" y="330" text-anchor="middle" fill="#d9c99c" font-family="Georgia,serif" font-size="105">★</text>
<text x="90" y="122" fill="#d9c99c" font-family="Arial,sans-serif" font-size="19" font-weight="700" letter-spacing="6">OPEN SOURCE / MILESTONE</text>
<text x="90" y="210" fill="#f3f0e5" font-family="Georgia,serif" font-size="42">${repo}</text>
<text x="90" y="345" fill="#d9c99c" font-family="Georgia,serif" font-size="96">${xml(data.milestone.toLocaleString("en-US"))}</text>
<text x="90" y="395" fill="#f3f0e5" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="5">STARS</text>
<path d="M90 441h675" stroke="#655e49" stroke-width="1"/>
<text x="90" y="489" fill="#f3f0e5" font-family="Arial,sans-serif" font-size="22">${xml(momentum)}</text>
<text x="90" y="550" fill="#ada994" font-family="Arial,sans-serif" font-size="17">VERIFIED PUBLIC COUNT · ${xml(data.issuedOn)}</text>
<text x="1110" y="550" text-anchor="end" fill="#ada994" font-family="Arial,sans-serif" font-size="15">GITHUB TRAFFIC ANALYTICS</text>
</svg>`;
}
