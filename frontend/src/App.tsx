import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Historico } from '@/pages/Historico';
import { Simulador } from '@/pages/Simulador';
import { Comparador } from '@/pages/Comparador';
import { Oportunidades } from '@/pages/Oportunidades';

// Placeholder components for routes
const Dashboard = () => <h1 className="text-2xl font-bold">Dashboard</h1>;
const Reportes = () => <h1 className="text-2xl font-bold">Generador de Reportes</h1>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/comparador" element={<Comparador />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
