import './App.css';
import useConnection from "./hooks/useConnection";
import useContract from "./hooks/useContract";
import racekronojson from "./metadata/racekrono.json";
import { raceTimerAddress } from "./config";
import { useState, useEffect } from "react";
import { Form, Table, InputGroup, Button, Container, Row, Col, Alert, ListGroup, ListGroupItem, FormControl} from 'react-bootstrap';
import { FaWallet, IconName } from "react-icons/fa";


function App() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime0, setCurrentTime0] = useState('');
  const [takeTime0, setTakeTime0] = useState([]);
  const [signedTime, setSignedTime] = useState([]);
  
  const connection = useConnection();
  const contract = useContract(raceTimerAddress, racekronojson.abi);
  
  const listTimes = async () => {
    //kontrattan dönen değeri data değişkeninde tutuyoruz.
    //kontrattan bir array dönüyor.
    alert("List Times Started")
    const data = await contract.list();

    console.log(data);

    const items = await Promise.all(data.map(async (i) => {

      let item = {
        a: i.doorNumber,
        y: i.finishTime
      };
      return item;
    
    }));
    console.log(items);

    setSignedTime(items);

    
    alert("ListTimes worked")

  };



  const signTime = async (e) => {

    alert("SignTime 1")
    
    let theDoor = e.target.parentNode.children[0].value;
    let theTime = e.target.previousSibling.value;

    console.log(theDoor)
    console.log(theTime)

    const txn = await contract.takeTime(theDoor, theTime); 
    alert(theDoor)
    alert(theTime)
 
    await txn.wait();

    alert('before calling listtime')

    listTimes();

    alert("SignTime 2")

    
      e.target.disabled = true;
      e.target.nextSibling.disabled = true;
      e.target.value="Signed";
      e.target.parentNode.children[0].disabled = true;
      e.target.parentNode.style.backgroundColor = "yellowgreen";
  alert("SignTime 3")

  };


  const canceler = (e) => {
      e.target.disabled = true;
      e.target.previousSibling.disabled = true;
      e.target.value="Cancelled";
      e.target.parentNode.children[0].disabled = true;
      e.target.parentNode.style.backgroundColor = "pink";



  };

  const listItems = takeTime0.map((e, index) => {
   
        return <ListGroupItem key={index} className="mb-1" style={{display:"flex"}} variant='secondary' disabled={false}>

              <FormControl className='item' readOnly={false} placeholder='Door Number' defaultValue={""} type='number'></FormControl>

              <Button type={null} className='item' size='lg' variant='none' value={e}>{e}</Button>

              <Button as="input" readOnly className='item' variant="success" onClick={signTime} disabled={false} defaultValue="Sign"></Button>
            
              <Button as="input" readOnly className='item' variant="danger" style={{marginRight:'0'}} onClick={canceler} disabled={false} defaultValue="Cancel"></Button>
        
        </ListGroupItem>
    
  }  
  );

  const results = signedTime?.map((e, index) => {
    return  <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.a}</td>
              <td>{e.y}</td>
            </tr>
    }
    );
  
  const flyingFinish = () => {
    setTakeTime0((takeTime0) => [...takeTime0, currentTime0]);
  };
//----------------------------
 useEffect(() => {
    connection.connect();
    //her renderda cüzdanın bağlı olup olmadığının kontrolünü yaptıktan sonra listTasks() fonksiyonu çağırıyoruz 
    if (connection.address) {
      listTimes();
    }
  }, [connection.address])

  useEffect(() => {

    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let h = new Date().getHours();
    let m = new Date().getMinutes();
    let s = new Date().getSeconds();
    let ms = new Date().getMilliseconds();

    date = checkTime(date);
    month = checkTime(month);
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    ms = checkMs(ms);


    function checkTime(i) {
      if (i < 10) { i = "0" + i }
      return i;
    }

    function checkMs(x) {
      if (x < 10) { x = "00" + x }
      if (x >= 10 && x < 100) { x = "0" + x }
      return x;
    }

    setTimeout(() => {
      setCurrentTime0(h + ":" + m + ":" + s + ":" + ms);
    }, 1);


    setCurrentDate(date + "/" + month + "/" + year);

  });
//--------------------------------
return (
    <>
    <Container className='App sticky-top p-0 mb-3'>    
      <p className='par p-0'>Flying Finish</p>
      <p className='par p-0'>{currentDate}</p>
      <Button onClick={flyingFinish}>{currentTime0}</Button>
    </Container>
   
    <Container>
      <Row>
      <Col md={3}>
        {connection.address && (
          <div className='list-inline'>
            <FaWallet className='list-inline-item'/>
            <p className='list-inline-item wallet-address'>
          {connection.address}
        </p>
        </div>
        )}
      </Col>
      <Col xs={12} md={6}>
        <ListGroup>
          {listItems}
        </ListGroup>
      </Col>
      <Col md={3}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Door Number</th>
              <th>Finish Time</th>
            </tr>
          </thead>
          <tbody>
            {results}
          </tbody>
        </Table>         
        </Col>
      </Row>        
    </Container>
    </>

    
  );

}

export default App;
