import Student from "./Student";
import Guardian from "./Guardian";

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

function Home() {
  return (
    <>
    <div style={containerStyle}>
      <h1>Home Component</h1>
    </div>
      <Student />
      <Guardian />
    </>
  );
}

export default Home;
