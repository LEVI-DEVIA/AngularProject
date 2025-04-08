import { Routes } from '@angular/router';
import { AssignmentsComponent } from './assignments/assignments.component';
import { AddAssignmentComponent } from './assignments/add-assignment/add-assignment.component';
import { NavigationErrorComponent } from './navigation-error-component/navigation-error-component.component';
import { AssignmentDetailComponent } from './assignments/assignment-detail/assignment-detail.component';
import { EditAssignmentComponent } from './assignments/edit-assignment/edit-assignment.component';

export const routes: Routes = [
    // Pour la page d'accueil
    // On y accèdera avec l'URL : http://localhost:4200/home
    // ou simplement http://localhost:4200
    {path: '', component: AssignmentsComponent},
    {path: 'home', component: AssignmentsComponent},
    // Pour l'ajout d'assignments
    // On y accèdera avec l'URL : http://localhost:4200/add
    {path: 'add', component: AddAssignmentComponent},
 // Pour le détail d'un assignment
    // On y accèdera avec l'URL : http://localhost:4200/assignment/1 ou
    // http://localhost:4200/assignment/2 ou ... avec 1 
    // qui représente l'id de l'assignment
    {path: 'assignments/:id', component: AssignmentDetailComponent},
    // Pour la modification d'un assignment existant
    {path: 'assignments/:id/edit', component: EditAssignmentComponent},
   
    // Pour l'erreur 404
    // On y accèdera avec n'importe quelle URL qui ne correspond pas
    // à une route définie
    {path: '**', component:NavigationErrorComponent}
];
