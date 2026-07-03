import { Link } from "react-router"

export default function Bar(){


    return(
        <div className="drag sticky top-0 w-full bg-base-100 flex justify-end items-center">
            <div className="flex-1 flex justify-start">
                <Link to={'/'} className="link link-hover m-3">
                    return home
                </Link>
            </div>
            <button className='btn btn-ghost' onClick={() => window.electron.minimize()}>−</button>
            <button className='btn btn-ghost btn-error' onClick={() => window.electron.close()}>✕</button>
        </div>
    )
}