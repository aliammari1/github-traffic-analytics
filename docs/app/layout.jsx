// SPDX-License-Identifier: MIT
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: {
    default: "GitHub Traffic Analytics Docs",
    template: "%s – GitHub Traffic Analytics",
  },
  description: "Documentation for the GitHub Traffic Analytics dashboard.",
};

export default async function RootLayout({ children }) {
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={<b>GitHub Traffic Analytics</b>}
              projectLink="https://github.com/aliammari1/github-traffic-analytics"
            />
          }
          footer={<Footer>MIT © {new Date().getFullYear()} Ali Ammari.</Footer>}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/aliammari1/github-traffic-analytics/tree/main/docs"
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
