'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  GitCommit, 
  Star, 
  GitFork, 
  Users,
  Award,
  Zap
} from 'lucide-react';

interface LiveActivity {
  id: string;
  type: 'commit' | 'pull_request' | 'star' | 'follow' | 'release' | 'issue';
  message: string;
  repository?: string;
  user?: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

interface LiveActivityFeedProps {
  className?: string;
  maxItems?: number;
}

export function LiveActivityFeed({ className = '', maxItems = 10 }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [isLive, setIsLive] = useState(true);

  const activityTypes = {
    commit: { icon: GitCommit, color: 'bg-green-500', label: 'Commit' },
    pull_request: { icon: GitFork, color: 'bg-blue-500', label: 'PR' },
    star: { icon: Star, color: 'bg-yellow-500', label: 'Star' },
    follow: { icon: Users, color: 'bg-purple-500', label: 'Follow' },
    release: { icon: Award, color: 'bg-red-500', label: 'Release' },
    issue: { icon: Activity, color: 'bg-orange-500', label: 'Issue' }
  };

  // Simulate live activities
  useEffect(() => {
    if (!isLive) return;

    const generateRandomActivity = (): LiveActivity => {
      const types: (keyof typeof activityTypes)[] = ['commit', 'pull_request', 'star', 'follow', 'release', 'issue'];
      const type = types[Math.floor(Math.random() * types.length)];
      const repositories = ['react-dashboard', 'api-server', 'mobile-app', 'data-pipeline', 'ui-components'];
      const users = ['alex-dev', 'sarah-code', 'mike-ops', 'jenny-design', 'tom-backend'];
      
      const messages = {
        commit: [`Nouveau commit sur ${repositories[Math.floor(Math.random() * repositories.length)]}`, 'Mise à jour de la documentation', 'Correction de bug critique', 'Ajout de nouvelles fonctionnalités'],
        pull_request: [`PR ouverte: Feature/new-dashboard`, 'PR mergée: Fix/security-patch', 'PR en révision: Update/dependencies'],
        star: [`${users[Math.floor(Math.random() * users.length)]} a ajouté une étoile`, 'Nouveau star sur le projet principal'],
        follow: [`${users[Math.floor(Math.random() * users.length)]} vous suit maintenant`, 'Nouveau follower GitHub'],
        release: [`Version 2.1.0 publiée`, 'Release candidate disponible', 'Hotfix 1.5.3 déployé'],
        issue: [`Nouveau bug reporté`, 'Issue fermée: Security vulnerability', 'Feature request créé']
      };

      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
        repository: type !== 'follow' ? repositories[Math.floor(Math.random() * repositories.length)] : undefined,
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: new Date(),
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };
    };

    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateRandomActivity();
        const updated = [newActivity, ...prev].slice(0, maxItems);
        return updated;
      });
    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds

    return () => clearInterval(interval);
  }, [isLive, maxItems]);

  const toggleLive = () => setIsLive(!isLive);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <motion.div
              animate={{ rotate: isLive ? 360 : 0 }}
              transition={{ duration: 2, repeat: isLive ? Infinity : 0, ease: 'linear' }}
            >
              <Activity className='h-5 w-5 text-blue-500' />
            </motion.div>
            <h3 className='text-lg font-semibold'>Activité en direct</h3>
          </div>
          
          <div className='flex items-center gap-3'>
            <Badge 
              variant={isLive ? 'default' : 'secondary'}
              className='flex items-center gap-1'
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'}`}
                animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: isLive ? Infinity : 0 }}
              />
              {isLive ? 'En direct' : 'Arrêté'}
            </Badge>
            
            <motion.button
              onClick={toggleLive}
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLive ? 'Arrêter' : 'Démarrer'}
            </motion.button>
          </div>
        </div>

        <div className='space-y-3 max-h-96 overflow-y-auto'>
          <AnimatePresence mode='popLayout'>
            {activities.map((activity, index) => {
              const ActivityIcon = activityTypes[activity.type].icon;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  layout
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
                    ${activity.priority === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' : 
                      activity.priority === 'medium' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' : 
                      'bg-muted/50 hover:bg-muted/70'}
                  `}
                >
                  <motion.div
                    className={`p-2 rounded-full ${activityTypes[activity.type].color}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <ActivityIcon className='h-3 w-3 text-white' />
                  </motion.div>
                  
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <p className='text-sm font-medium truncate'>
                          {activity.message}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          {activity.repository && (
                            <Badge variant='outline' className='text-xs'>
                              {activity.repository}
                            </Badge>
                          )}
                          {activity.user && (
                            <span className='text-xs text-muted-foreground'>
                              par {activity.user}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <time className='text-xs text-muted-foreground whitespace-nowrap'>
                        {activity.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </time>
                    </div>
                  </div>
                  
                  {activity.priority === 'high' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='flex-shrink-0'
                    >
                      <Zap className='h-4 w-4 text-red-500' />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {activities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-center py-8 text-muted-foreground'
            >
              <Activity className='h-12 w-12 mx-auto mb-3 opacity-50' />
              <p>En attente d&apos;activité...</p>
              {!isLive && (
                <p className='text-xs mt-2'>Cliquez sur &apos;Démarrer&apos; pour voir l&apos;activité en direct</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Live indicator overlay */}
        {isLive && (
          <motion.div
            className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500'
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </CardContent>
    </Card>
  );
}
