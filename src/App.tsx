import { Container } from "./styles";
import { useContracts } from "./hooks";

const App = () => {
  const { sendCoins } = useContracts();

  return <Container>I'm the app</Container>;
};

export default App;
