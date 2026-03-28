import { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api/exams';

export const useResults = (studentId?: string, examId?: string) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getResults({ studentId, examId });
      if (res.success) {
        setResults(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId, examId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { results, loading, error, fetchResults };
};

export const useHallTicket = (studentId: string, examId: string) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!studentId || !examId) return;
    setLoading(true);
    try {
      const res = await api.getHallTicket(studentId, examId);
      if (res.success) {
        setTicket(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId, examId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, loading, error, fetchTicket };
};

export const useExamAnalysis = (examId: string) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await api.generateExamAnalysis(examId);
      if (res.success) {
        setAnalysis(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return { analysis, loading, error, fetchAnalysis };
};
