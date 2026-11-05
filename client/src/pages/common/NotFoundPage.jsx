import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="text-7xl font-extrabold text-brand-600 tracking-tight">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500">
            The collegiate resource or portal page you are looking for has been moved or does not exist.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" icon={Home}>
              Return Home
            </Button>
          </Link>
          <Link to="/clubs">
            <Button variant="outline" icon={Compass}>
              Explore Clubs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
