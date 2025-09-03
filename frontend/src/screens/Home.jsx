import React, { useState, useEffect } from 'react'
import { useUser } from '../context/user.context'
import axios from '../config/axios.jsx'
import { useNavigate } from 'react-router-dom';

export default function Home() {

  const { user, setUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [project, setProject] = useState([]);
  const navigate = useNavigate();
  

  useEffect(() => { // get all projects of logged in user

    axios.get('/projects/all').then((res) => {
      setProject(res.data.projects);

    }).catch(err => {
      console.log(err);
    })

  }, [])


  function createProject(e) {
    e.preventDefault();
    axios.post('/projects/create', { name: projectName })
      .then((res) => {
        if (res.data.project) {
          setProject(prevProjects => [...prevProjects, res.data.project]);
        } else {
          // If response has different structure
          setProject(prevProjects => [...prevProjects, res.data]);
        }        setProjectName('');
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log('Project Created :',projectName);
  }

  const handleLogout = async () => {
    try {
      await axios.get('/users/logout' );
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Logout Button */}
      <div className="fixed top-6 right-6 z-10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg cursor-pointer bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white/90 hover:shadow-md transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <i className="ri-logout-box-line"></i>
          <span>Logout</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Projects</h1>
        
        <div className="projects grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* New Project Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group h-48 relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <div className="h-12 w-12 mb-4 rounded-full cursor-pointer bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
              <i className="ri-add-line text-2xl text-blue-500 group-hover:text-white"></i>
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 font-medium">Create New Project</span>
          </button>

          {/* Project Cards */}
          {project.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate('/project', { state: {project}})}
              className="group h-48 relative flex flex-col p-6 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {project.name}
              </h2>

              <div className="mt-auto flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                  <i className="ri-user-line text-blue-500"></i>
                  <span className="text-sm text-blue-600">
                    {project.users.length} Collaborators
                  </span>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="ri-arrow-right-line text-blue-500"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Updated Design */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Project</h2>
              <form onSubmit={createProject} className="space-y-4">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter project name..."
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
