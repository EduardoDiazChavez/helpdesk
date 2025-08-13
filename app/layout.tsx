import { FC, PropsWithChildren } from "react";
import "./ui/globals.css";

const layout:FC<PropsWithChildren> = ({children}) => {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}

export default layout;