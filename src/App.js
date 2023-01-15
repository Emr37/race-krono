import './App.css';
import useConnection from "./hooks/useConnection";
import useContract from "./hooks/useContract";
import racekronojson from "./metadata/racekrono.json";
import { raceTimerAddress } from "./config";
import { useState, useEffect } from "react";
import { Table, Button, Container, Row, Col, ListGroup, ListGroupItem, FormControl} from 'react-bootstrap';
import { FaWallet } from "react-icons/fa";


function App() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [takeTime, setTakeTime] = useState([]);
  const [signedTime, setSignedTime] = useState([]);
  
  const connection = useConnection();
  const contract = useContract(raceTimerAddress, racekronojson.abi);

  // Akıllı sözleşmeden veri çeken fonksiyon
  const listTimes = async () => {
  // Akıllı sözleşmeden array olarak gelen değeri data isimli değişkene atayıp, arrayi bir objeye çeviriyoruz.
    const data = await contract.list();
    const items = await Promise.all(data.map(async (i) => {

      let item = {
        a: i.doorNumber,
        y: i.finishTime
      };
      return item;    
    }));
    // Items objesini signedTime arrayi içine hook kullanarak atıyoruz.
    setSignedTime(items);
  };

  // Alınan zamanı ve sonrasında girilen kapı numarasını akıllı sözleşmeye gönderen fonksiyon
  const signTime = async (e) => {
  // Akıllı sözleşmeye gönderilecek kapı numarası ve finish zamanını ilgili satırdan almak için değişkenlere atıyoruz
    let theDoor = e.target.parentNode.children[0].value;
    let theTime = e.target.previousSibling.value;

  // Sözleşmenin içinde yazılı olan takeTime fonksiyonuna sözleşmede belirttiğimiz gibi iki parametre giriyoruz
    const txn = await contract.takeTime(theDoor, theTime);

  // Sözleşmeye yapılan transferin bitmesini bekliyoruz
    await txn.wait();
  
  // Üst satırlarda bulunan bu fonksiyonu çağırarak yeni gönderilen verilerde dahil sözleşmede bulunan verileri çekiyoruz.
    listTimes();

  // İlgili satırın görsel olarak değiştiriyor. Tekrar aynı verinin gönderilmesini engelliyor.
      e.target.disabled = true;
      e.target.nextSibling.disabled = true;
      e.target.value="Signed";
      e.target.parentNode.children[0].disabled = true;
      e.target.parentNode.style.backgroundColor = "yellowgreen";
  };

  // Onaylanmış sözleşmeye aktarılan bilgileri akıllı sözleşmeden siliyor
  const deleteTime = async (i) =>{
    const txn = await contract.removeTime(i);
    await txn.wait();
    listTimes();
  };

  // Yanlış alınan finish zamanının iptalini daha önyüz tarafında iptal ediyor. Verinin sözleşmeye gönderilmesini engelliyor
  const canceler = (e) => {
      e.target.disabled = true;
      e.target.previousSibling.disabled = true;
      e.target.value="Cancelled";
      e.target.parentNode.children[0].disabled = true;
      e.target.parentNode.style.backgroundColor = "pink";
  };

  // Alınan zamanın önyüzde listelenmesini sağlıyor
  const listItems = takeTime.map((e, index) => {
   
    return  <ListGroupItem key={index} className="mb-1" style={{display:"flex"}} variant='secondary' disabled={false}>
              <FormControl className='item' readOnly={false} placeholder='Door Number' defaultValue={""} type='number'></FormControl>
              <Button type="hidden" className='item' size='lg' variant='none' value={e}>{e}</Button>
              <Button as="input" readOnly className='item' variant="success" onClick={signTime} disabled={false} defaultValue="Sign"></Button>
              <Button as="input" readOnly className='item' variant="danger" style={{marginRight:'0'}} onClick={canceler} disabled={false} defaultValue="Cancel"></Button>
            </ListGroupItem>    
  });

  // Akıllı sözleşmeden  çekilmiş verinin önyüzde listelenmesini sağlıyor
  const results = signedTime?.map((e, index) => {

    return  <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.a}</td>
              <td>{e.y}</td>
              <td><span onClick={() => deleteTime(index)}>Delete</span></td>
            </tr>
    });
  
  // Anlık zamanı yakalayan ve takeTime arrayi içine bir sezonluk gönderen fonksiyon
  const flyingFinish = () => {
    setTakeTime((takeTime) => [...takeTime, currentTime]);
  };

 // Cüzdan bağlı olduğunda akıllı sözleşmeden listTimes() fonksiyonu ile verileri çekiyor
 useEffect(() => {
    connection.connect();
    if (connection.address) {
      listTimes();
    }
  }, [connection.address])

  // Anlık tarihi ve zamanı oluşturarak currentTime ve currentDate statelerine gönderiyor
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
              <div className='list-inline'>
                <h6>Connected Wallet Address</h6>
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
                  <th></th>
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
