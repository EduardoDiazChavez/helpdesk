import { FC, PropsWithChildren } from "react";
import "./ui/globals.css";
import { Header } from "@/components/layout/header";


const layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html>
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}

export default layout;