'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function DbTest() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);

  // Create a user
  const createUser = async () => {
    try {
      setStatus('Creating user...');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserId(data.id);
        setStatus(`User created with ID: ${data.id}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Create a resume
  const createResume = async () => {
    try {
      setStatus('Creating resume...');
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          content: {
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: [
              {
                company: 'Example Company',
                role: 'Software Developer',
                startDate: '2020-01-01',
                endDate: '2022-01-01',
                description: 'Worked on various projects',
              },
            ],
            education: [
              {
                institution: 'Example University',
                degree: 'Bachelor of Science',
                field: 'Computer Science',
                startDate: '2016-01-01',
                endDate: '2020-01-01',
              },
            ],
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResumeId(data.id);
        setStatus(`Resume created with ID: ${data.id}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Get all users
  const getUsers = async () => {
    try {
      setStatus('Fetching users...');
      const response = await fetch('/api/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
        setStatus(`Found ${data.length} users`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Get resumes for a user
  const getResumes = async () => {
    try {
      setStatus('Fetching resumes...');
      const response = await fetch(`/api/resumes?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setResumes(data);
        setStatus(`Found ${data.length} resumes`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>Add a new user to the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <Button onClick={createUser}>Create User</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Resume</CardTitle>
          <CardDescription>Add a new resume for a user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
            />
          </div>
          <div>
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Professional Resume"
            />
          </div>
          <Button onClick={createResume}>Create Resume</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fetch Data</CardTitle>
          <CardDescription>Retrieve data from the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={getUsers}>Get All Users</Button>
            <Button onClick={getResumes}>Get User's Resumes</Button>
          </div>
          
          {users.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Users:</h3>
              <ul className="list-disc pl-5">
                {users.map((user: any) => (
                  <li key={user.id}>
                    {user.name} ({user.email}) - ID: {user.id}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {resumes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Resumes:</h3>
              <ul className="list-disc pl-5">
                {resumes.map((resume: any) => (
                  <li key={resume.id}>
                    {resume.title} - ID: {resume.id}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardFooter>
          <div className="w-full p-2 bg-gray-100 rounded">
            Status: {status}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}