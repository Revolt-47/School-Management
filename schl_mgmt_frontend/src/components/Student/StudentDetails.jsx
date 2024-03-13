import { useParams } from "react-router-dom"
import Cookies from 'js-cookie';

function StudentDetails() {
  const { studentId } = useParams();
  const token = Cookies.get('token');
  const school = JSON.parse(Cookies.get('school'));
  const schoolId = school._id;
  console.log("School Id: " + schoolId);
  console.log("Student Id: "+studentId);
  return (
    <div>StudentDetails</div>
  )
}

export default StudentDetails