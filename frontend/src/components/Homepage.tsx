type Props = {
username: string
onLogout: () => void
}


export default function Homepage({ username, onLogout }: Props) {
return (
<div>
<h2>Welcome, {username}</h2>
<button onClick={onLogout}>Logout</button>
</div>
)
}