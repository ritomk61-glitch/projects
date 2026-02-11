

export default function C(props){
    console.log(props.uname);

    return(
        <>
        <div className="box">
            <h2>Name:{props.uname}</h2>
            <h2>:Email{props.uemail}</h2>
            <h2>Age:{props.uage}</h2>
        </div>
        </>
    )
}
