import { useMemo, useState } from 'react';

const shortenAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function App() {
  const [isWalletPopupOpen, setIsWalletPopupOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletError, setWalletError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });
  const [savedMessage, setSavedMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [detailsMessage, setDetailsMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const walletLabel = useMemo(() => {
    if (!walletAddress) {
      return 'Connect Wallet';
    }

    return shortenAddress(walletAddress);
  }, [walletAddress]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
    setSavedMessage('');
    setTransactionHash('');
  };

  const handleConnectWallet = async () => {
    setWalletError('');
    if (!window.ethereum) {
      setWalletError('MetaMask is not installed in this browser.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletPopupOpen(false);
      }
    } catch (error) {
      setWalletError(error.message || 'Wallet connection was cancelled.');
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setWalletError('');
    setIsWalletPopupOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSavedMessage('');
    setTransactionHash('');
    setDetailsMessage('');

    if (!walletAddress) {
      setDetailsMessage('Please connect your wallet before saving.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${backendUrl}/api/user-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save details.');
      }

      setSavedMessage('Details saved to contract.');
      setTransactionHash(data.transactionHash || '');
    } catch (error) {
      setDetailsMessage(error.message || 'Unable to save details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetDetails = async () => {
    setDetailsMessage('');
    setSavedMessage('');
    setTransactionHash('');

    if (!walletAddress) {
      setDetailsMessage('Please connect your wallet first.');
      return;
    }

    try {
      setIsFetchingDetails(true);
      const response = await fetch(`${backendUrl}/api/user-details`);

      if (!response.ok) {
        throw new Error('Unable to get details from backend.');
      }

      const data = await response.json();
      const userDetails = data.data || data;

      setFormData({
        name: userDetails.name || '',
        mobile: userDetails.mobile || userDetails.mobileNumber || '',
      });
      setDetailsMessage('Details loaded from backend contract data.');
    } catch (error) {
      setDetailsMessage(error.message || 'Unable to get details.');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="form-title">
        <div className="wallet-row">
          <button className="connect-button" type="button" onClick={() => setIsWalletPopupOpen(true)}>
            {walletLabel}
          </button>
        </div>

        <div className="heading-block">
          <p>Blockchain UI</p>
          <h1 id="form-title">User Details</h1>
        </div>

        <form className="user-form" onSubmit={handleSubmit}>
          <label htmlFor="name">
            Name
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </label>

          <label htmlFor="mobile">
            Mobile Number
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              pattern="[0-9]{10}"
              title="Enter a 10 digit mobile number"
              required
            />
          </label>

          <div className="form-actions">
            <button className="save-button" type="submit" disabled={isSaving}>
              {isSaving && <span className="button-spinner" aria-hidden="true" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="details-button"
              type="button"
              onClick={handleGetDetails}
              disabled={isFetchingDetails}
            >
              {isFetchingDetails ? 'Loading...' : 'Get Details'}
            </button>
          </div>
        </form>

        {savedMessage && <p className="success-message">{savedMessage}</p>}
        {transactionHash && (
          <div className="transaction-box">
            <span>Transaction Hash</span>
            <p>{transactionHash}</p>
          </div>
        )}
        {detailsMessage && <p className="details-message">{detailsMessage}</p>}
      </section>

      {isWalletPopupOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsWalletPopupOpen(false)}>
          <section
            className="wallet-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              aria-label="Close wallet popup"
              onClick={() => setIsWalletPopupOpen(false)}
            >
              x
            </button>

            <h2 id="wallet-title">{walletAddress ? 'Wallet Connected' : 'Connect Crypto Wallet'}</h2>
            <p className="modal-copy">
              {walletAddress
                ? 'Your wallet is connected to this app.'
                : 'Choose MetaMask to connect your wallet account to this app.'}
            </p>

            {walletAddress ? (
              <div className="connected-wallet">
                <span>Connected Address</span>
                <strong>{shortenAddress(walletAddress)}</strong>
                <button className="disconnect-button" type="button" onClick={handleDisconnectWallet}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button className="wallet-option" type="button" onClick={handleConnectWallet}>
                <span className="wallet-icon">M</span>
                <span>
                  <strong>MetaMask</strong>
                  <small>Browser wallet</small>
                </span>
              </button>
            )}

            {walletError && <p className="error-message">{walletError}</p>}
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
