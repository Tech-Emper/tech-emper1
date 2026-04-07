import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

export default function DashboardWrapped() {
    const { profile, recommendations, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;

    if (!profile || !recommendations || recommendations.length === 0) {
        // If they have no recommendations yet, they haven't finished the journey.
        return <Navigate to="/details" replace />;
    }

    return (
        <div className="w-full flex justify-center">
            <Dashboard 
                userProfile={profile} 
                latestRecommendation={recommendations[0]} 
                history={recommendations} 
                onUpdatePlan={() => navigate('/details')}
                onCompleteExistingDetails={() => navigate('/details')}
                onBack={() => {}} 
            />
        </div>
    );
}
