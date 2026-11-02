import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
class AppErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error,info){console.error('Mining UI failed:',error,info);}
  render(){if(this.state.error)return <div style={{fontFamily:'system-ui',background:'#eaf1f9',minHeight:'100vh',padding:'8vh 20px'}}><div style={{background:'#fff',maxWidth:660,margin:'auto',padding:30,borderRadius:20}}><b style={{color:'#176be1'}}>Zidane Mining Operations</b><h1>Aplikasi mengalami kendala</h1><p>Progress lokal tidak otomatis dihapus. Coba muat ulang. Jika belum berhasil, kirimkan pesan error berikut:</p><pre style={{whiteSpace:'pre-wrap',background:'#eef4fc',padding:12}}>{String(this.state.error?.message)}</pre><button style={{padding:'12px 18px',background:'#246ee2',color:'white',border:0,borderRadius:8}} onClick={()=>location.reload()}>Muat ulang</button></div></div>;return this.props.children;}
}
createRoot(document.getElementById('root')).render(<AppErrorBoundary><App/></AppErrorBoundary>);
