import { Link, Route, Routes } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import Home from './Home';
import SignIn from './SignIn';
import SignUp from './SignUp';

function NavBar() {
    const navLinksStyle = {
        marginLeft: "5px",
        marginRight: "5px",
        color: "white",
    }
    return (

        <div style={{ marginLeft: "10px", marginRight: "10px", marginTop: "10px" }}>
            <Navbar className='rounded' collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand as={Link} to="/" style={{ marginLeft: "20px" }}>Van Guardian</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse style={{ justifyContent: "center" }} id="responsive-navbar-nav">
                    <Nav style={{ fontSize: "20px", paddingInline: "20px" }}>
                        <Nav.Link as={Link} to="/home" style={navLinksStyle}>Home</Nav.Link>
                        <Nav.Link as={Link} to="/about" style={navLinksStyle}>About</Nav.Link>
                        <Nav.Link as={Link} to="/services" style={navLinksStyle}>Services</Nav.Link>
                        <Nav.Link as={Link} to="/contact" style={navLinksStyle}>Contact</Nav.Link>
                        <Nav.Link as={Link} to="/signIn" style={navLinksStyle}>Login</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/signIn/*" element={<SignIn />} />
                <Route path="/signUp" element={<SignUp />} />
            </Routes>
        </div>
    );
}

export default NavBar
