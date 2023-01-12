import './App.css';
import { raceTimerAddress } from "./config";
import useConnection from "./hooks/useConnection";
import useContract from "./hooks/useContract";
import racekronojson from "./metadata/racekrono.json";
import { useState, useEffect } from "react";
import { Form, InputGroup, Button, Container, Row, Col, Alert, ListGroup, ListGroupItem, FormControl} from 'react-bootstrap';




function App() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [takeTime, setTakeTime] = useState([]);
  const [doorNumber, setDoorNumber] = useState("");
  const [signedTime, setSignedTime] = useState("");
  const [times, setTimes] = useState([]);

  const connection = useConnection();
  const contract = useContract(raceTimerAddress, racekronojson.abi);


  const flyingFinish = (e) => {
    setTakeTime((takeTime) => [...takeTime, currentTime]);
   
  };
  
  

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
      setCurrentTime(h + ":" + m + ":" + s + ":" + ms);
    }, 1);


    setCurrentDate(date + "/" + month + "/" + year);

  });



  const signer = async (e) => {

    const txn = await contract.takeTime(doorNumber, signedTime);
    await txn.wait();
    listTimes();
      e.target.disabled = true;
      e.target.nextSibling.disabled = true;
      e.target.value="Signed";
      e.target.parentNode.children[0].disabled = true;
      e.target.parentNode.style.backgroundColor = "yellowgreen";
      setDoorNumber(e.target.parentNode.children[0].value);
   
  };


  



  const canceler = (e) => {
      e.target.disabled = true;
      e.target.previousSibling.disabled = true;
      e.target.value="Cancelled";
      e.target.parentNode.children[0].disabled = true;
      e.target.parentNode.style.backgroundColor = "pink";



  };


  


  const listItems = takeTime.map((e, index) => {
    

        return <ListGroupItem key={index} className="mb-1" style={{display:"flex"}} variant='secondary' disabled={false}>

              <FormControl className='item' readOnly={false} placeholder='Door Number' defaultValue={""} type='number'></FormControl>

              <div className='item' style={{backgroundcolor:"blue"}}>{e}</div>

              <Button as="input" readOnly className='item' variant="success" onClick={signer} disabled={false} defaultValue="Sign"></Button>
            
              <Button as="input" readOnly className='item' variant="danger" style={{marginRight:'0'}} onClick={canceler} disabled={false} defaultValue="Cancel"></Button>
        
        </ListGroupItem>
    
  }  
  );  

  const listTimes = async () => {

    //kontrattan dönen değeri data değişkeninde tutuyoruz.
    //kontrattan bir array dönüyor.
    const data = await contract.list();
    //
    const items = await Promise.all(data.map(async i => {
      //döngünün her bir adımında bir nesne oluşturuyoruz.
      let item = {
        doorNumber: i.doorNumber,
        signedTime: i.currentTime
      }
      return item
    }))
    //döngü sonucunda dolan items arrayini tasks state'imize koyuyoruz.
    setTimes(items);
    console.log(items);
  }

 
//----------------------------
  useEffect(() => {
    connection.connect();
    //her renderda cüzdanın bağlı olup olmadığının kontrolünü yaptıktan sonra listTasks() fonksiyonu çağırıyoruz 
    if (connection.address) {
     // listTimes();
    }
  }, [connection.address])
//--------------------------------
  return (
    <>
    <Container className='App sticky-top p-0 mb-3'>    
      <p className='par p-0'>Flying Finish</p>
      <p className='par p-0'>{currentDate}</p>
      <Button onClick={flyingFinish}>{currentTime}</Button>
    </Container>

    
    <Container>
      <Row>
      <Col md={3}>
        {connection.address && (
        <p>
          {connection.address}
        </p>
        )}
      </Col>

      <Col xs={12} md={6}>

        <ListGroup>
          {listItems}
        </ListGroup>
      </Col>
      <Col md={3}> {doorNumber} {times?.map((time, i) => (
        <div key={i}>
          <h1>{time.doorNumber}{time.currentTime}</h1>
        </div>))}
        {doorNumber}
        </Col>
      </Row>
        
      </Container>
    </>

    
  );

}

export default App;
