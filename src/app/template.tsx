import { ViewTransition } from "react";

/**
 * Transition de page : fondu + léger mouvement vertical (voir .page dans globals.css).
 * Utilise l'API View Transitions du navigateur ; sans support, la navigation
 * reste simplement instantanée. Le header est ancré (view-transition-name).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
