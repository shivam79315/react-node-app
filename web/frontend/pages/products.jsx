import {Link, AccountConnection} from '@shopify/polaris';
import {useState, useCallback} from 'react';

export default function AccountConnectionExample() {
  const [connected, setConnected] = useState(false);
  const accountName = connected ? 'Jane Appleseed' : '';

  const handleAction = useCallback(() => {
    setConnected((connected) => !connected);
  }, []);

  const buttonText = connected ? 'Disconnect' : 'Connect';
  const details = connected ? 'Account connected' : 'No account connected';
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept Sample App’s{' '}
      <Link url="Example App">terms and conditions</Link>. You’ll pay a
      commission rate of 15% on sales made through Sample App.
    </p>
  );

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-violet-200 w-full max-w-sm rounded-md border-2 border-violet-600 p-6 text-center">
        <h1 className="text-indigo-800 text-3xl font-extrabold mb-4">
          Hello, Tailwind v4!
        </h1>
        <p className="text-violet-900 mb-2">
          Tailwind CSS utilities are working correctly.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">
          Click me
        </button>
      </div>
    </div>
  );
}