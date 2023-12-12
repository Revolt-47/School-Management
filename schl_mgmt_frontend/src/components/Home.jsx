import Student from "./Student";

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
    </>
  );
}

export default Home;
