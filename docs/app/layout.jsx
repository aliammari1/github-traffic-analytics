// SPDX-License-Identifier: MIT
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: {
    default: "GitHub Traffic Analytics Docs",
    template: "%s – GitHub Traffic Analytics",
  },
  description: "Documentation for the GitHub Traffic Analytics dashboard.",
};

const navbar = (
  <Navbar
    logo={<b>GitHub Traffic Analytics</b>}
    projectLink="https://github.com/aliammari1/github-traffic-analytics"
  />
);

const footer = <Footer>MIT {new Date().getFullYear()} © Ali Ammari.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          banner={<Banner storageKey="ghta-14day">GitHub traffic API only exposes 14 days — this app persists daily snapshots.</Banner>}
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/aliammari1/github-traffic-analytics/tree/main/docs"
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
