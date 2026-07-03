import { ReactNode } from "react";
import Bar from "./Bar"

interface Content {
  children: ReactNode;  // Accepts any valid JSX content
}


export default function Frame({ children }: Content){

    return(
    <div className='flex flex-col justify-start items-center h-screen'>
      <Bar/>
      <div className='flex-1 flex justify-center gap-3 items-center'>
        {children}
      </div>
    </div>
    )
}