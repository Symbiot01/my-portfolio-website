'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { TripRead } from '@/types';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: ${({ theme }) => theme.titleGradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.mutedText};
  font-size: 1.1rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const CreateCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const TripCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const TripName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const TripDescription = styled.p`
  color: ${({ theme }) => theme.mutedText};
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
`;

const TripMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.mutedText};
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ViewButton = styled(Link)`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.accent};
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.mutedText};
`;

export default function TripSyncIndexPage() {
  const { user, isLoading } = useAuth();
  const [trips, setTrips] = useState<TripRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    const run = async () => {
      try {
        const data = await api.getMyTrips();
        console.log('Fetched trips:', data);
        setTrips(data);
      } catch (e) {
        console.error('Failed to fetch trips:', e);
        // Show error to user
        alert('Failed to load trips. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user, isLoading]);

  const createTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const newTrip = await api.createTrip({ name, description: description || null });
      setTrips([newTrip, ...trips]);
      setName('');
      setDescription('');
    } catch (e) {
      alert('Failed to create trip');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    return (
      <>
        <Navbar />
        <Container>
          <EmptyState>
            Please <Link href="/login">log in</Link> to view your trips.
          </EmptyState>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container>
        <Header>
          <Title>TripSync</Title>
          <Subtitle>Plan, track, and share your adventures</Subtitle>
        </Header>

        <Section>
          <SectionTitle>Create New Trip</SectionTitle>
          <CreateCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Form onSubmit={createTrip}>
              <Input
                placeholder="Trip name (e.g. Iceland 2025)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextArea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Trip'}
              </Button>
            </Form>
          </CreateCard>
        </Section>

        <Section>
          <SectionTitle>Past Trips</SectionTitle>
          {loading ? (
            <EmptyState>Loading trips...</EmptyState>
          ) : trips.length === 0 ? (
            <EmptyState>No trips yet. Create your first trip above!</EmptyState>
          ) : (
            <Grid>
              {trips.map((trip, i) => (
                <TripCard
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <TripName>{trip.name}</TripName>
                  <TripDescription>
                    {trip.description || 'No description provided'}
                  </TripDescription>
                  <TripMeta>
                    <span>{trip.members.length} member{trip.members.length !== 1 ? 's' : ''}</span>
                    <ViewButton href={`/tripsync/${trip.id}`}>View Trip</ViewButton>
                  </TripMeta>
                </TripCard>
              ))}
            </Grid>
          )}
        </Section>
      </Container>
    </>
  );
}


