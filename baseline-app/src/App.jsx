import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, Calendar, MapPin, X, Check,
  TrendingUp, Users, Swords, Activity, Target, Flame, Trophy, Plus, Minus, Search, Mail, Phone, User, Lock, Eye, EyeOff
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

/* ============================================================
   THEME — clay court / vintage tennis club badge
   ============================================================ */
const C = {
  // Court surfaces
  clay: '#C4522A',          // terracotta clay court
  clayMid: '#A8421E',       // deeper clay
  clayDeep: '#7A2E12',      // dark clay shadow
  clayLight: '#D97B50',     // highlight clay

  // Parchment / paper
  parchment: '#F0E8D0',     // aged paper
  parchmentWarm: '#E8DCC0', // warmer parchment
  parchmentDeep: '#D4C49A', // border/ruled lines

  // Court lines / net
  courtWhite: '#F5F0E8',    // white court lines (warm)
  net: '#2A1F14',           // dark net/ink

  // Forest green (from badge)
  green: '#2B4A2E',         // laurel wreath green
  greenMid: '#3D6642',      // mid green
  greenLight: '#6B9B70',    // light green

  // Typography
  ink: '#1C130A',           // near-black, warm
  inkSoft: '#3D2E1E',       // dark brown
  inkMute: '#7A6548',       // muted tan-brown

  // Ball yellow
  optic: '#E8C93A',         // tennis ball yellow
  opticDeep: '#C4A020',     // deeper yellow

  // Semantic
  win: '#2B4A2E',
  loss: '#A8421E',
  line: '#C8B48A',          // ruled line
};


const SUPABASE_URL = 'https://oyqryjmlwdhcvvktkfub.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VQQ3MVMlFaGjYbNqxIJ-Og_JVZNOtSK';
const RESEND_KEY = '';

const sendEmail = async ({ to, subject, html }) => {
  if (!to) return;
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (e) {
    console.error('Email send error:', e);
  }
};
const DEFAULT_PASSWORD = 'tennis123';

const sb = {
  async from(table) {
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    return {
      async select(query = '*') {
        const r = await fetch(`${base}?select=${query}`, { headers });
        return r.json();
      },
      async insert(data) {
        const r = await fetch(base, { method: 'POST', headers, body: JSON.stringify(data) });
        return r.json();
      },
      async upsert(data) {
        const h = { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' };
        const r = await fetch(base, { method: 'POST', headers: h, body: JSON.stringify(data) });
        return r.json();
      },
      async update(data, match) {
        const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
        const r = await fetch(`${base}?${params}`, { method: 'PATCH', headers, body: JSON.stringify(data) });
        return r.json();
      },
      async delete(match) {
        const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
        const r = await fetch(`${base}?${params}`, { method: 'DELETE', headers });
        return r.ok;
      },
      async selectWhere(field, value, query = '*') {
        const r = await fetch(`${base}?select=${query}&${field}=eq.${encodeURIComponent(value)}`, { headers });
        return r.json();
      },
    };
  }
};

const SESSION_KEY = 'baseline-session-v1';
const ADMINS = ['raulbfernandez@gmail.com'];

/* ============================================================
   SEED DATA — Los Feliz Tennis Club
   ============================================================ */
const seedPlayers = () => ([
  { id: 'p1',   name: 'Dan Addelson',        email: 'Daddelson@gmail.com',              phone: '',                  gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p2',   name: 'Stephan Andrews',     email: 'stephan.m.andrews@gmail.com',      phone: '(412) 330-7125',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p3',   name: 'Jacob Antolini',      email: 'jantolini80@gmail.com',            phone: '(323) 636-5361',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p4',   name: 'Oscar Arroyo',        email: 'oscararroyo217@gmail.com',         phone: '(559) 920-6081',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p5',   name: 'Gates Bradley',       email: 'not.gates@gmail.com',              phone: '512-206-6140',      gender: 'Male', points: 8, wins: 1, losses: 3, streak: 1 },
  { id: 'p6',   name: 'Chris Campbell-Orrock', email: 'chriscampbellorrock@gmail.com', phone: '(617) 823-9747',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p7',   name: 'Davin Cho',           email: 'dcho1733@gmail.com',               phone: '847-651-8664',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p8',   name: 'Amir Cohen',          email: 'amir@amircohen.com',               phone: '818-645-5250',      gender: 'Male', points: 27, wins: 6, losses: 2, streak: -1 },
  { id: 'p9',   name: 'Molly Cranna',        email: 'Molly.cranna@gmail.com',           phone: '617-230-4698',      gender: 'Female', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p10',  name: 'Sean Cunningham',     email: 'seandirectsthings@gmail.com',      phone: '315-430-9644',      gender: 'Male', points: 2, wins: 0, losses: 1, streak: -1 },
  { id: 'p11',  name: 'Artin Davodian',      email: 'artin300@yahoo.com',               phone: '818-653-1299',      gender: 'Male', points: 26, wins: 6, losses: 2, streak: 4 },
  { id: 'p12',  name: 'Mitch Eakins',        email: 'mitcheakins@gmail.com',            phone: '910-612-9109',      gender: 'Male', points: 17, wins: 3, losses: 5, streak: 1 },
  { id: 'p13',  name: 'Will Emery',          email: 'Willemeryfilm@gmail.com',          phone: '(707) 321-1571',    gender: 'Male', points: 17, wins: 4, losses: 1, streak: 1 },
  { id: 'p14',  name: 'Ally Fekaiki',        email: 'a.fekaiki@gmail.com',              phone: '(213) 679-4128',    gender: 'Male', points: 6, wins: 0, losses: 6, streak: -6 },
  { id: 'p15',  name: 'Michael Fernandez',   email: 'Mikevfernandez@gmail.com',         phone: '(310) 699-9823',    gender: 'Male', points: 7, wins: 1, losses: 3, streak: -3 },
  { id: 'p16',  name: 'Ruben Fernandez',     email: 'rubenruss@me.com',                 phone: '(323) 547-3008',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p17',  name: 'Raul Fernandez',      email: 'raulbfernandez@gmail.com',         phone: '954-257-9002',      gender: 'Male', points: 5, wins: 1, losses: 1, streak: 1 },
  { id: 'p18',  name: 'Zach Fishbain',       email: 'zfishbain@gmail.com',              phone: '262-994-7545',      gender: 'Male', points: 16, wins: 4, losses: 1, streak: 2 },
  { id: 'p19',  name: 'Brad Gilboe',         email: 'bradgilboe@gmail.com',             phone: '818-632-2296',      gender: 'Male', points: 33, wins: 7, losses: 8, streak: -1 },
  { id: 'p20',  name: 'Miguel Hadelich',     email: 'miguel.hadelich@gmail.com',        phone: '818-625-2873',      gender: 'Male', points: 5, wins: 1, losses: 1, streak: 1 },
  { id: 'p21',  name: 'Yoram Heller',        email: 'yoram.heller@gmail.com',           phone: '(646) 372-0003',    gender: 'Male', points: 10, wins: 2, losses: 2, streak: 2 },
  { id: 'p22',  name: 'Andre Herrero',       email: 'andreherrero@gmail.com',           phone: '(360) 739-9549',    gender: 'Male', points: 3, wins: 0, losses: 2, streak: -2 },
  { id: 'p23',  name: 'Peter Hyan',          email: 'peterhyan@hotmail.com',            phone: '213-718-6607',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p24',  name: 'Jeff Israel',         email: 'jtisrael@gmail.com',               phone: '(917) 586-3942',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p25',  name: 'James Joslin',        email: 'james.brewster.joslin@gmail.com',  phone: '(419) 340-7296',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p26',  name: 'Ezekiel Joubert',     email: 'ejoubertiii@gmail.com',            phone: '734-716-2625',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p27',  name: 'Elijah Kim',          email: 'elijahkim@gmail.com',              phone: '310-425-9390',      gender: 'Male', points: 30, wins: 7, losses: 4, streak: 2 },
  { id: 'p28',  name: 'Spencer Kimes',       email: 'Spencer.kimes@gmail.com',          phone: '916-622-9580',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p29',  name: 'Seth Klugman',        email: 'sethklugman@gmail.com',            phone: '(310) 854-2318',    gender: 'Male', points: 11, wins: 2, losses: 4, streak: 1 },
  { id: 'p30',  name: 'Ashok Krishna',       email: 'krishna.ashok@gmail.com',          phone: '',                  gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p31',  name: 'Alex Lehmann',        email: 'mralexlehmann@gmail.com',          phone: '(310) 922-5737',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p32',  name: 'Ray Li',              email: 'Raymondxli@gmail.com',             phone: '(646) 241-8003',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p33',  name: 'Gabe Manabat',        email: 'esgmanabat@gmail.com',             phone: '323-633-1169',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p34',  name: 'Kelly McMillen',      email: 'kjmcmillen@yahoo.com',             phone: '310-592-1541',      gender: 'Male', points: 13, wins: 3, losses: 1, streak: 3 },
  { id: 'p35',  name: 'Pete Meyers',         email: 'meyerspa@gmail.com',               phone: '818-426-8881',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p36',  name: 'Nelson Miranda',      email: 'nelsonmenell@gmail.com',           phone: '(202) 812-4218',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p37',  name: 'Krish Nathan',        email: 'Krishnathan@me.com',               phone: '(818) 554-8274',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p38',  name: 'Tony Ngo',            email: 'tony.ngo@gmail.com',               phone: '714-307-1729',      gender: 'Male', points: 24, wins: 4, losses: 6, streak: -3 },
  { id: 'p39',  name: 'Steve Pillemer',      email: 'Stevepillemer@gmail.com',          phone: '(424) 335-1657',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p40',  name: 'Alex Plapinger',      email: 'asplapinger@gmail.com',            phone: '(310) 430-8430',    gender: 'Male', points: 11, wins: 3, losses: 0, streak: 3 },
  { id: 'p41',  name: 'Eric Priestley',      email: 'erictpriestley@gmail.com',         phone: '949-466-5817',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p42',  name: 'Mark Raia',           email: 'mraia12@gmail.com',                phone: '213-210-8245',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p43',  name: 'Chris Rose',          email: 'hellochrisrose@gmail.com',         phone: '512-289-7118',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p44',  name: 'Jerry Santana',       email: 'gerardsantana1@gmail.com',         phone: '323-307-6858',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p45',  name: 'Steve Sekkas',        email: 'Stevemsekkas@gmail.com',           phone: '(310) 704-6700',    gender: 'Male', points: 13, wins: 2, losses: 3, streak: -1 },
  { id: 'p46',  name: 'Edward Shin',         email: 'edwardshinn@gmail.com',            phone: '213-435-0378',      gender: 'Male', points: 21, wins: 4, losses: 4, streak: -2 },
  { id: 'p47',  name: 'Tyler Simmons',       email: 'tytysimmons@gmail.com',            phone: '949-290-2370',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p48',  name: 'Paul Stanczak',       email: 'paulstanczak@gmail.com',           phone: '323-877-6002',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p49',  name: 'Alex Stock',          email: 'alexgstock@gmail.com',             phone: '925-330-1916',      gender: 'Male', points: 22, wins: 4, losses: 6, streak: 1 },
  { id: 'p50',  name: 'Zach Sutton',         email: 'zsuttmusic@gmail.com',             phone: '323-304-0351',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p51',  name: 'Mark Tewarson',       email: 'tewar1@yahoo.com',                 phone: '917-554-6569',      gender: 'Male', points: 1, wins: 0, losses: 1, streak: -1 },
  { id: 'p52',  name: 'Benny Tran',          email: 'bennybtran@gmail.com',             phone: '310-985-5623',      gender: 'Male', points: 1, wins: 0, losses: 1, streak: -1 },
  { id: 'p53',  name: 'Alex Utay',           email: 'autay622@gmail.com',               phone: '917-499-4999',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p54',  name: 'Peyton Wallace',      email: 'Peytonwallace@gmail.com',          phone: '310-614-6519',      gender: 'Male', points: 12, wins: 3, losses: 0, streak: 3 },
  { id: 'p55',  name: 'Frank Walsh',         email: 'frank@manuka.la',                  phone: '310-880-2223',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p56',  name: 'Mark Whalen',         email: 'Mark@markwhalenstudio.com',        phone: '(213) 595-4973',    gender: 'Male', points: 1, wins: 0, losses: 1, streak: -1 },
  { id: 'p57',  name: 'Tony Wise',           email: 'anthonymwise@gmail.com',           phone: '213-503-0142',      gender: 'Male', points: 13, wins: 3, losses: 2, streak: -1 },
  { id: 'p58',  name: 'Brad Zeff',           email: 'bradzeff@gmail.com',               phone: '310-907-6515',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
]);

const seedMatches = () => ([
  {id:'m1',a:'p18',b:'p38',status:'completed',winnerId:'p18',score:'6-3,4-6, (13-11)',sets:[{a:6,b:3},{a:4,b:6},{a:13,b:11,isTiebreak:true}],date:'2026-04-24',change:3},
  {id:'m2',a:'p8',b:'p29',status:'completed',winnerId:'p8',score:'6-4,6-0',sets:[{a:6,b:4},{a:6,b:0}],date:'2026-04-23',change:4},
  {id:'m3',a:'p18',b:'p49',status:'completed',winnerId:'p18',score:'6-3,4-6, (10-5)',sets:[{a:6,b:3},{a:4,b:6},{a:10,b:5,isTiebreak:true}],date:'2026-04-18',change:3},
  {id:'m4',a:'p27',b:'p18',status:'completed',winnerId:'p27',score:'6-4,1-6, (10-7)',sets:[{a:6,b:4},{a:1,b:6},{a:10,b:7,isTiebreak:true}],date:'2026-04-14',change:3},
  {id:'m5',a:'p8',b:'p49',status:'completed',winnerId:'p8',score:'6-3,7-6 (7-5)',sets:[{a:6,b:3},{a:7,b:6}],date:'2026-04-11',change:4},
  {id:'m6',a:'p18',b:'p45',status:'completed',winnerId:'p18',score:'6-4,6-4',sets:[{a:6,b:4},{a:6,b:4}],date:'2026-04-11',change:4},
  {id:'m7',a:'p18',b:'p19',status:'completed',winnerId:'p18',score:'7-5,6-4',sets:[{a:7,b:5},{a:6,b:4}],date:'2026-04-04',change:4},
  {id:'m8',a:'p11',b:'p19',status:'completed',winnerId:'p11',score:'6-2,7-6 (7-2)',sets:[{a:6,b:2},{a:7,b:6}],date:'2026-04-04',change:4},
  {id:'m9',a:'p11',b:'p46',status:'completed',winnerId:'p11',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-03-30',change:4},
  {id:'m10',a:'p13',b:'p34',status:'completed',winnerId:'p13',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-03-26',change:4},
  {id:'m11',a:'p46',b:'p8',status:'completed',winnerId:'p46',score:'6-7 (5-7),6-3, (10-2)',sets:[{a:6,b:7},{a:6,b:3},{a:10,b:2,isTiebreak:true}],date:'2026-03-23',change:3},
  {id:'m12',a:'p34',b:'p19',status:'completed',winnerId:'p34',score:'6-4,6-0',sets:[{a:6,b:4},{a:6,b:0}],date:'2026-03-22',change:4},
  {id:'m13',a:'p13',b:'p19',status:'completed',winnerId:'p13',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-03-21',change:4},
  {id:'m14',a:'p8',b:'p51',status:'completed',winnerId:'p8',score:'6-2,6-0',sets:[{a:6,b:2},{a:6,b:0}],date:'2026-03-21',change:4},
  {id:'m15',a:'p38',b:'p12',status:'completed',winnerId:'p38',score:'6-1,6-4',sets:[{a:6,b:1},{a:6,b:4}],date:'2026-03-16',change:4},
  {id:'m16',a:'p15',b:'p14',status:'completed',winnerId:'p15',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-03-11',change:4},
  {id:'m17',a:'p57',b:'p12',status:'completed',winnerId:'p57',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-03-09',change:4},
  {id:'m18',a:'p13',b:'p29',status:'completed',winnerId:'p13',score:'6-0,6-0',sets:[{a:6,b:0},{a:6,b:0}],date:'2026-03-09',change:4},
  {id:'m19',a:'p54',b:'p57',status:'completed',winnerId:'p54',score:'6-4,6-1',sets:[{a:6,b:4},{a:6,b:1}],date:'2026-03-05',change:4},
  {id:'m20',a:'p38',b:'p27',status:'completed',winnerId:'p38',score:'4-6,6-1, (10-7)',sets:[{a:4,b:6},{a:6,b:1},{a:10,b:7,isTiebreak:true}],date:'2026-03-04',change:3},
  {id:'m21',a:'p49',b:'p14',status:'completed',winnerId:'p49',score:'6-1,6-0',sets:[{a:6,b:1},{a:6,b:0}],date:'2026-03-04',change:4},
  {id:'m22',a:'p12',b:'p14',status:'completed',winnerId:'p12',score:'6-2,6-0',sets:[{a:6,b:2},{a:6,b:0}],date:'2026-03-03',change:4},
  {id:'m23',a:'p46',b:'p15',status:'completed',winnerId:'p46',score:'6-2,6-1',sets:[{a:6,b:2},{a:6,b:1}],date:'2026-03-02',change:4},
  {id:'m24',a:'p46',b:'p20',status:'completed',winnerId:'p46',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2026-03-01',change:4},
  {id:'m25',a:'p54',b:'p46',status:'completed',winnerId:'p54',score:'6-1,6-4',sets:[{a:6,b:1},{a:6,b:4}],date:'2026-02-27',change:4},
  {id:'m26',a:'p19',b:'p38',status:'completed',winnerId:'p19',score:'5-7,6-0, (10-6)',sets:[{a:5,b:7},{a:6,b:0},{a:10,b:6,isTiebreak:true}],date:'2026-02-26',change:3},
  {id:'m27',a:'p27',b:'p17',status:'completed',winnerId:'p27',score:'6-0,3-6, (10-7)',sets:[{a:6,b:0},{a:3,b:6},{a:10,b:7,isTiebreak:true}],date:'2026-02-26',change:3},
  {id:'m28',a:'p49',b:'p38',status:'completed',winnerId:'p49',score:'3-6,6-3, (10-4)',sets:[{a:3,b:6},{a:6,b:3},{a:10,b:4,isTiebreak:true}],date:'2026-02-25',change:3},
  {id:'m29',a:'p46',b:'p22',status:'completed',winnerId:'p46',score:'6-3,6-0',sets:[{a:6,b:3},{a:6,b:0}],date:'2026-02-22',change:4},
  {id:'m30',a:'p57',b:'p49',status:'completed',winnerId:'p57',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2026-02-21',change:4},
  {id:'m31',a:'p27',b:'p46',status:'completed',winnerId:'p27',score:'2-6,6-4, (10-8)',sets:[{a:2,b:6},{a:6,b:4},{a:10,b:8,isTiebreak:true}],date:'2026-02-19',change:3},
  {id:'m32',a:'p29',b:'p22',status:'completed',winnerId:'p29',score:'6-2,6-7 (5-7),7-6 (10-8)',sets:[{a:6,b:2},{a:6,b:7},{a:7,b:6}],date:'2026-02-14',change:3},
  {id:'m33',a:'p40',b:'p46',status:'completed',winnerId:'p40',score:'6-0,1-6,7-6 (10-8)',sets:[{a:6,b:0},{a:1,b:6},{a:7,b:6}],date:'2026-02-14',change:3},
  {id:'m34',a:'p19',b:'p45',status:'completed',winnerId:'p19',score:'3-6,6-3, (10-8)',sets:[{a:3,b:6},{a:6,b:3},{a:10,b:8,isTiebreak:true}],date:'2026-02-13',change:3},
  {id:'m35',a:'p34',b:'p13',status:'completed',winnerId:'p34',score:'6-4,6-4',sets:[{a:6,b:4},{a:6,b:4}],date:'2026-02-13',change:4},
  {id:'m36',a:'p34',b:'p11',status:'completed',winnerId:'p34',score:'6-4,7-6 (7-5)',sets:[{a:6,b:4},{a:7,b:6}],date:'2026-02-10',change:4},
  {id:'m37',a:'p40',b:'p15',status:'completed',winnerId:'p40',score:'6-4,6-1',sets:[{a:6,b:4},{a:6,b:1}],date:'2026-02-07',change:4},
  {id:'m38',a:'p13',b:'p19',status:'completed',winnerId:'p13',score:'7-5,7-6 (8-6)',sets:[{a:7,b:5},{a:7,b:6}],date:'2026-02-07',change:4},
  {id:'m39',a:'p49',b:'p5',status:'completed',winnerId:'p49',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-02-07',change:4},
  {id:'m40',a:'p45',b:'p27',status:'completed',winnerId:'p45',score:'6-0,6-4',sets:[{a:6,b:0},{a:6,b:4}],date:'2026-02-06',change:4},
  {id:'m41',a:'p27',b:'p11',status:'completed',winnerId:'p27',score:'2-6,7-6 (7-2),7-6 (10-7)',sets:[{a:2,b:6},{a:7,b:6},{a:7,b:6}],date:'2026-02-06',change:3},
  {id:'m42',a:'p11',b:'p19',status:'completed',winnerId:'p11',score:'7-5,6-3',sets:[{a:7,b:5},{a:6,b:3}],date:'2026-02-06',change:4},
  {id:'m43',a:'p45',b:'p12',status:'completed',winnerId:'p45',score:'6-1,6-4',sets:[{a:6,b:1},{a:6,b:4}],date:'2026-02-05',change:4},
  {id:'m44',a:'p19',b:'p5',status:'completed',winnerId:'p19',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-02-05',change:4},
  {id:'m45',a:'p17',b:'p12',status:'completed',winnerId:'p17',score:'3-6,6-4,7-6 (10-8)',sets:[{a:3,b:6},{a:6,b:4},{a:7,b:6}],date:'2026-02-03',change:3},
  {id:'m46',a:'p40',b:'p29',status:'completed',winnerId:'p40',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-01-31',change:4},
  {id:'m47',a:'p20',b:'p14',status:'completed',winnerId:'p20',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-01-30',change:4},
  {id:'m48',a:'p12',b:'p5',status:'completed',winnerId:'p12',score:'2-6,6-4,7-5',sets:[{a:2,b:6},{a:6,b:4},{a:7,b:5}],date:'2026-01-29',change:3},
  {id:'m49',a:'p57',b:'p27',status:'completed',winnerId:'p57',score:'6-0,2-6,7-6 (10-3)',sets:[{a:6,b:0},{a:2,b:6},{a:7,b:6}],date:'2026-01-29',change:3},
  {id:'m50',a:'p11',b:'p45',status:'completed',winnerId:'p11',score:'6-1,3-6,7-6 (10-7)',sets:[{a:6,b:1},{a:3,b:6},{a:7,b:6}],date:'2026-01-28',change:3},
  {id:'m51',a:'p11',b:'p21',status:'completed',winnerId:'p11',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-01-26',change:4},
  {id:'m52',a:'p54',b:'p21',status:'completed',winnerId:'p54',score:'7-5,6-4',sets:[{a:7,b:5},{a:6,b:4}],date:'2026-01-26',change:4},
  {id:'m53',a:'p19',b:'p10',status:'completed',winnerId:'p19',score:'7-6 (7-5),3-6,7-6 (10-6)',sets:[{a:7,b:6},{a:3,b:6},{a:7,b:6}],date:'2026-01-24',change:3},
  {id:'m54',a:'p38',b:'p15',status:'completed',winnerId:'p38',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-01-23',change:4},
  {id:'m55',a:'p8',b:'p14',status:'completed',winnerId:'p8',score:'6-0,6-0',sets:[{a:6,b:0},{a:6,b:0}],date:'2026-01-23',change:4},
  {id:'m56',a:'p38',b:'p52',status:'completed',winnerId:'p38',score:'6-3,6-0',sets:[{a:6,b:3},{a:6,b:0}],date:'2026-01-22',change:4},
  {id:'m57',a:'p5',b:'p14',status:'completed',winnerId:'p5',score:'6-1,6-0',sets:[{a:6,b:1},{a:6,b:0}],date:'2026-01-20',change:4},
  {id:'m58',a:'p21',b:'p12',status:'completed',winnerId:'p21',score:'6-0,6-3',sets:[{a:6,b:0},{a:6,b:3}],date:'2026-01-20',change:4},
  {id:'m59',a:'p8',b:'p49',status:'completed',winnerId:'p8',score:'6-4,7-6 (7-4)',sets:[{a:6,b:4},{a:7,b:6}],date:'2026-01-17',change:4},
  {id:'m60',a:'p19',b:'p57',status:'completed',winnerId:'p19',score:'7-6 (10-8),6-3',sets:[{a:7,b:6},{a:6,b:3}],date:'2026-01-17',change:4},
  {id:'m61',a:'p27',b:'p38',status:'completed',winnerId:'p27',score:'7-6 (7-4),6-4',sets:[{a:7,b:6},{a:6,b:4}],date:'2026-01-15',change:4},
  {id:'m62',a:'p12',b:'p49',status:'completed',winnerId:'p12',score:'6-4,6-4',sets:[{a:6,b:4},{a:6,b:4}],date:'2026-01-14',change:4},
  {id:'m63',a:'p8',b:'p29',status:'completed',winnerId:'p8',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2026-01-10',change:4},
  {id:'m64',a:'p21',b:'p19',status:'completed',winnerId:'p21',score:'6-4,7-5',sets:[{a:6,b:4},{a:7,b:5}],date:'2026-01-10',change:4},
  {id:'m65',a:'p19',b:'p27',status:'completed',winnerId:'p19',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-01-09',change:4},
  {id:'m66',a:'p11',b:'p49',status:'completed',winnerId:'p11',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2025-12-29',change:4},
  {id:'m67',a:'p29',b:'p56',status:'completed',winnerId:'p29',score:'6-1,7-6 (7-5)',sets:[{a:6,b:1},{a:7,b:6}],date:'2025-12-20',change:4},
  {id:'m68',a:'p19',b:'p38',status:'completed',winnerId:'p19',score:'6-0,7-5',sets:[{a:6,b:0},{a:7,b:5}],date:'2025-12-20',change:4},
  {id:'m69',a:'p49',b:'p38',status:'completed',winnerId:'p49',score:'6-2,6-1',sets:[{a:6,b:2},{a:6,b:1}],date:'2025-12-18',change:4},
  {id:'m70',a:'p27',b:'p8',status:'completed',winnerId:'p27',score:'6-4,7-6 (7-4)',sets:[{a:6,b:4},{a:7,b:6}],date:'2025-12-13',change:4},
  {id:'m71',a:'p27',b:'p19',status:'completed',winnerId:'p27',score:'6-4,6-0',sets:[{a:6,b:4},{a:6,b:0}],date:'2025-12-11',change:4},
]);

const VENUES = ['Vermont Canyon', 'Griffith Park / Riverside', "Artin's of Glendale", 'Griffith Park Carousel', 'Other'];

/* ============================================================
   HELPERS
   ============================================================ */
/**
 * Calculate points earned by each player in a match.
 * Rules:
 *  - Everyone gets 1 point for playing
 *  - 1 point per set won
 *  - 1 bonus point for winning in straight sets (2 sets, no 3rd)
 *
 * sets: array of { a: number, b: number } (scores for player A and B)
 * winnerId: 'a' | 'b' (relative, not player id)
 * Returns { a: points, b: points }
 */
const calcPoints = (sets, winnerSide) => {
  const validSets = sets.filter(s => s !== null);
  let aPoints = 1; // participation
  let bPoints = 1;

  // Points per set won
  for (const s of validSets) {
    if (s.a > s.b) aPoints++;
    else bPoints++;
  }

  // Straight sets bonus (winner won in exactly 2 sets)
  if (validSets.length === 2) {
    if (winnerSide === 'a') aPoints += 1;
    else bPoints += 1;
  }

  return { a: aPoints, b: bPoints };
};

const rank = (players) => [...players].sort((a, b) => {
  if (b.points !== a.points) return b.points - a.points;
  return (b.wins + b.losses) - (a.wins + a.losses); // tiebreaker: more matches played ranks higher
});
const find = (players, id) => players.find(p => p.id === id);
const rankOf = (players, id) => rank(players).findIndex(p => p.id === id) + 1;

const initials = (name) => name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtDateTime = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/* Derive all stats for a player from the completed match list */
const calcStats = (playerId, matches, players) => {
  const completed = matches.filter(m => m.status === 'completed' && (m.a === playerId || m.b === playerId));

  let matchWins = 0, matchLosses = 0;
  let setsWon = 0, setsLost = 0;
  let gamesWon = 0, gamesLost = 0;
  const h2h = {}; // opponentId -> { wins, losses }

  for (const m of completed) {
    const side = m.a === playerId ? 'a' : 'b';
    const oppSide = side === 'a' ? 'b' : 'a';
    const oppId = m[oppSide];
    const won = m.winnerId === playerId;

    won ? matchWins++ : matchLosses++;

    if (!h2h[oppId]) h2h[oppId] = { wins: 0, losses: 0 };
    won ? h2h[oppId].wins++ : h2h[oppId].losses++;

    if (m.sets && Array.isArray(m.sets)) {
      for (const s of m.sets) {
        if (!s) continue;
        const myGames = s[side] ?? 0;
        const oppGames = s[oppSide] ?? 0;
        gamesWon += myGames;
        gamesLost += oppGames;
        if (myGames > oppGames) setsWon++;
        else if (oppGames > myGames) setsLost++;
      }
    }
  }

  const winRate = matchWins + matchLosses > 0
    ? Math.round((matchWins / (matchWins + matchLosses)) * 100) : 0;

  const h2hList = Object.entries(h2h).map(([id, record]) => ({
    player: find(players, id),
    ...record,
  })).filter(e => e.player).sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));

  return { matchWins, matchLosses, setsWon, setsLost, gamesWon, gamesLost, winRate, h2hList, played: completed.length };
};

/* ============================================================
   LOGIN SCREEN
   ============================================================ */
function LoginScreen({ players, passwords, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const normalized = email.trim().toLowerCase();
    const player = players.find(p => p.email.toLowerCase() === normalized);
    if (!player) { setError('No account found with that email.'); return; }
    const stored = passwords[player.id] || DEFAULT_PASSWORD;
    if (password !== stored) { setError('Incorrect password.'); return; }
    setError('');
    onLogin(player.id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ fontFamily: '"DM Sans", sans-serif', background: '#E8DCC8' }}>
      <PaperTexture />
      {/* Tennis court — horizontal net, singles */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.2 }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {/* Singles court boundary */}
          <rect x="8%" y="5%" width="84%" height="90%" fill="none" stroke={C.clay} strokeWidth="2.5"/>
          {/* Net — horizontal center, extends beyond court */}
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke={C.clay} strokeWidth="3"/>
          {/* Service lines */}
          <line x1="8%" y1="28%" x2="92%" y2="28%" stroke={C.clay} strokeWidth="1.5"/>
          <line x1="8%" y1="72%" x2="92%" y2="72%" stroke={C.clay} strokeWidth="1.5"/>
          {/* Center service line */}
          <line x1="50%" y1="28%" x2="50%" y2="72%" stroke={C.clay} strokeWidth="1.5"/>
        </svg>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BaselineLogo size={52} />
        </div>

        <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${C.line}` }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: C.ink, marginBottom: 4 }}>
            Sign in
          </div>
          <div className="text-[12px] mb-5" style={{ color: C.inkMute }}>
            Use your club email and password
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold block mb-1.5" style={{ color: C.inkMute }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="your@email.com"
                autoCapitalize="none"
                autoCorrect="off"
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${error ? C.clay : C.line}`, borderRadius: 8, fontSize: 16, fontFamily: 'inherit', background: C.parchmentWarm, color: C.ink, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold block mb-1.5" style={{ color: C.inkMute }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 40px 12px 14px', border: `1.5px solid ${error ? C.clay : C.line}`, borderRadius: 8, fontSize: 16, fontFamily: 'inherit', background: C.parchmentWarm, color: C.ink, boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: 4 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-[12px] mb-3 px-3 py-2 rounded" style={{ background: `${C.clay}18`, color: C.clay }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg text-[13px] font-bold uppercase tracking-[0.1em]"
            style={{ background: C.clay, color: 'white' }}
          >
            Sign In
          </button>

          <div className="text-[11px] text-center mt-4" style={{ color: C.inkMute }}>
            Default password: <span style={{ fontFamily: '"JetBrains Mono", monospace', color: C.ink }}>tennis123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('ladder');
  const [players, setPlayers] = useState(seedPlayers);
  const [matches, setMatches] = useState(seedMatches);
  const [passwords, setPasswords] = useState({});
  const [deletedMatchIds, setDeletedMatchIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  /* Inject editorial fonts */
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  /* Load from Supabase on mount */
  useEffect(() => {
    (async () => {
      try {
        // Restore session
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const { userId } = JSON.parse(savedSession);
          if (userId) { setCurrentUserId(userId); setLoggedIn(true); }
        }

        // Load players from Supabase
        const db = await sb.from('players');
        const dbPlayers = await db.select();
        if (Array.isArray(dbPlayers) && dbPlayers.length > 0) {
          // Map Supabase snake_case to camelCase
          setPlayers(dbPlayers.map(p => ({
            id: p.id, name: p.name, email: p.email, phone: p.phone,
            gender: p.gender, points: p.points, wins: p.wins, losses: p.losses,
            streak: p.streak, ustaRating: p.usta_rating, profileImage: p.profile_image,
            isActive: p.is_active,
          })));
        } else {
          // First run — seed players into Supabase
          const seeds = seedPlayers();
          const db2 = await sb.from('players');
          await db2.upsert(seeds.map(p => ({
            id: p.id, name: p.name, email: p.email, phone: p.phone,
            gender: p.gender, points: p.points, wins: p.wins, losses: p.losses,
            streak: p.streak, usta_rating: p.ustaRating || null,
            profile_image: p.profileImage || null, is_active: p.isActive !== false,
          })));
        }

        // Load matches from Supabase
        const mdb = await sb.from('matches');
        const dbMatches = await mdb.select();
        if (Array.isArray(dbMatches) && dbMatches.length > 0) {
          setMatches(dbMatches.map(m => ({
            id: m.id, a: m.player_a, b: m.player_b, status: m.status,
            winnerId: m.winner_id, score: m.score, sets: m.sets,
            proposedDate: m.proposed_date, location: m.location,
            winnerChange: m.winner_change, loserChange: m.loser_change,
            change: m.change_pts, date: m.match_date,
          })));
        } else {
          // Seed matches
          const seeds = seedMatches();
          const mdb2 = await sb.from('matches');
          await mdb2.upsert(seeds.map(m => ({
            id: m.id, player_a: m.a, player_b: m.b, status: m.status,
            winner_id: m.winnerId || null, score: m.score || null, sets: m.sets || null,
            proposed_date: m.proposedDate || null, location: m.location || null,
            winner_change: m.winnerChange || null, loser_change: m.loserChange || null,
            change_pts: m.change || null, match_date: m.date || null,
          })));
          setMatches(seeds);
        }

        // Load passwords
        const pdb = await sb.from('passwords');
        const dbPasswords = await pdb.select();
        if (Array.isArray(dbPasswords)) {
          const pwMap = {};
          dbPasswords.forEach(row => { pwMap[row.player_id] = row.password_hash; });
          setPasswords(pwMap);
        }
      } catch (e) { console.error('Load error:', e); }
      setLoaded(true);
    })();
  }, []);

  /* Sync player to Supabase */
  const syncPlayer = async (player) => {
    try {
      const db = await sb.from('players');
      await db.upsert({
        id: player.id, name: player.name, email: player.email, phone: player.phone,
        gender: player.gender, points: player.points, wins: player.wins, losses: player.losses,
        streak: player.streak, usta_rating: player.ustaRating || null,
        profile_image: player.profileImage || null, is_active: player.isActive !== false,
      });
    } catch (e) { console.error('Sync player error:', e); }
  };

  /* Sync match to Supabase */
  const syncMatch = async (match) => {
    try {
      const db = await sb.from('matches');
      await db.upsert({
        id: match.id, player_a: match.a, player_b: match.b, status: match.status,
        winner_id: match.winnerId || null, score: match.score || null, sets: match.sets || null,
        proposed_date: match.proposedDate || null, location: match.location || null,
        winner_change: match.winnerChange || null, loser_change: match.loserChange || null,
        change_pts: match.change || null, match_date: match.date || null,
      });
    } catch (e) { console.error('Sync match error:', e); }
  };

  /* Delete match from Supabase */
  const deleteMatchFromDB = async (matchId) => {
    try {
      const db = await sb.from('matches');
      await db.delete({ id: matchId });
    } catch (e) { console.error('Delete match error:', e); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
    setLoggedIn(true);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
  };

  const handleSignOut = () => {
    setLoggedIn(false);
    setCurrentUserId(null);
    setTab('ladder');
    localStorage.removeItem(SESSION_KEY);
  };

  const reset = async () => {
    try {
      // Re-seed players
      const seeds = seedPlayers();
      const pdb = await sb.from('players');
      await pdb.upsert(seeds.map(p => ({
        id: p.id, name: p.name, email: p.email, phone: p.phone,
        gender: p.gender, points: p.points, wins: p.wins, losses: p.losses,
        streak: p.streak, usta_rating: null, profile_image: null, is_active: true,
      })));
      // Re-seed matches
      const mseeds = seedMatches();
      const mdb = await sb.from('matches');
      await mdb.upsert(mseeds.map(m => ({
        id: m.id, player_a: m.a, player_b: m.b, status: m.status,
        winner_id: m.winnerId || null, score: m.score || null, sets: m.sets || null,
        proposed_date: null, location: m.location || null,
        winner_change: m.winnerChange || null, loser_change: m.loserChange || null,
        change_pts: m.change || null, match_date: m.date || null,
      })));
      // Clear passwords
      const pwdb = await sb.from('passwords');
      // Can't bulk delete easily — just reset state
      setPlayers(seeds);
      setMatches(mseeds);
      setPasswords({});
      setDeletedMatchIds(new Set());
      setLoggedIn(false);
      setCurrentUserId(null);
      localStorage.removeItem(SESSION_KEY);
      showToast('Reset to fresh ladder');
    } catch (e) {
      console.error('Reset error:', e);
      showToast('Reset failed');
    }
  };

  const changePassword = async (newPassword) => {
    const me = find(players, currentUserId);
    if (!me) return;
    setPasswords(prev => ({ ...prev, [me.id]: newPassword }));
    try {
      const db = await sb.from('passwords');
      await db.upsert({ player_id: me.id, password_hash: newPassword });
    } catch (e) { console.error('Password save error:', e); }
    showToast('Password updated');
  };

  const resetUserPassword = async (playerId) => {
    setPasswords(prev => { const u = { ...prev }; delete u[playerId]; return u; });
    try {
      const db = await sb.from('passwords');
      await db.delete({ player_id: playerId });
    } catch (e) { console.error('Password reset error:', e); }
    showToast('Password reset to default');
  };

  const canManagePasswords = () => {
    const me = find(players, currentUserId);
    return me && ADMINS.includes(me.email.toLowerCase());
  };

  const isAdmin = () => {
    const me = find(players, currentUserId);
    return me && ADMINS.includes(me.email.toLowerCase());
  };

  const togglePlayerActive = async (playerId) => {
    const player = find(players, playerId);
    const newActive = player?.isActive === false ? true : false;
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isActive: newActive } : p));
    try {
      const db = await sb.from('players');
      await db.update({ is_active: newActive }, { id: playerId });
    } catch (e) { console.error('Toggle active error:', e); }
    showToast(newActive ? `${player?.name} shown` : `${player?.name} hidden`);
  };

  const updateProfile = async (updates) => {
    setPlayers(prev => prev.map(p => p.id === currentUserId ? { ...p, ...updates } : p));
    try {
      const db = await sb.from('players');
      await db.update({
        usta_rating: updates.ustaRating || null,
        profile_image: updates.profileImage || null,
      }, { id: currentUserId });
    } catch (e) { console.error('Profile update error:', e); }
    showToast('Profile updated');
  };

  /* Challenge another player */
  const proposeChallenge = async ({ opponentId, date, location }) => {
    const newMatch = {
      id: 'm' + Date.now(),
      a: currentUserId, b: opponentId,
      status: 'scheduled',
      proposedDate: date,
      location,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setMatches(prev => [newMatch, ...prev]);
    await syncMatch(newMatch);

    // Email the opponent
    const challenger = find(players, currentUserId);
    const opponent = find(players, opponentId);
    if (opponent?.email) {
      await sendEmail({
        to: opponent.email,
        subject: `🎾 You've been challenged on Los Feliz Tennis Club!`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #C4522A;">You've been challenged!</h2>
            <p><strong>${challenger?.name || 'A player'}</strong> has challenged you to a match on <strong>Los Feliz Tennis Club</strong>.</p>
            <table style="margin: 16px 0; border-collapse: collapse;">
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">📅 Date</td><td><strong>${date}</strong></td></tr>
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">📍 Location</td><td><strong>${location}</strong></td></tr>
            </table>
            <p>Log in to <a href="https://baseline-alpha.vercel.app" style="color: #C4522A;">Baseline</a> to view your challenge.</p>
            <p style="color: #7A6548; font-size: 13px;">— The Los Feliz Tennis Club Team</p>
          </div>
        `,
      });
    }

    showToast(`Challenge sent to ${opponent?.name}`);
  };

  const acceptMatch = async (matchId) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'scheduled' } : m));
    try { const db = await sb.from('matches'); await db.update({ status: 'scheduled' }, { id: matchId }); } catch(e) {}
    showToast('Match accepted');
  };
  const declineMatch = async (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    await deleteMatchFromDB(matchId);
    showToast('Challenge declined');
  };
  const cancelMatch = async (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    await deleteMatchFromDB(matchId);
    showToast('Match cancelled');
  };

  const deleteMatch = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== 'completed') return;

    const winnerId = match.winnerId;
    const loserId = winnerId === match.a ? match.b : match.a;
    const winnerPts = match.winnerChange ?? match.change ?? 0;
    const loserPts = match.loserChange ?? (() => {
      if (!match.sets) return 1;
      const validSets = match.sets.filter(s => s);
      let pts = 1;
      const loserSide = winnerId === match.a ? 'b' : 'a';
      const winnerSide = loserSide === 'a' ? 'b' : 'a';
      for (const s of validSets) { if (s[loserSide] > s[winnerSide]) pts++; }
      return pts;
    })();

    const updatedPlayers = players.map(p => {
      if (p.id === winnerId) return { ...p, points: Math.max(0, p.points - winnerPts), wins: Math.max(0, p.wins - 1), streak: 0 };
      if (p.id === loserId)  return { ...p, points: Math.max(0, p.points - loserPts),  losses: Math.max(0, p.losses - 1), streak: 0 };
      return p;
    });
    setPlayers(updatedPlayers);
    setMatches(prev => prev.filter(m => m.id !== matchId));

    // Sync to Supabase
    await deleteMatchFromDB(matchId);
    const winner = updatedPlayers.find(p => p.id === winnerId);
    const loser = updatedPlayers.find(p => p.id === loserId);
    if (winner) await syncPlayer(winner);
    if (loser) await syncPlayer(loser);
    showToast('Match deleted');
  };

  /* Report score and update points */
  const reportScore = async ({ matchId, winnerId, scoreStr, sets }) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    const loserId = winnerId === match.a ? match.b : match.a;
    const winnerSide = winnerId === match.a ? 'a' : 'b';
    const earned = calcPoints(sets, winnerSide);
    const winnerPoints = winnerSide === 'a' ? earned.a : earned.b;
    const loserPoints  = winnerSide === 'a' ? earned.b : earned.a;

    const newPlayers = players.map(p => {
      if (p.id === winnerId) return {
        ...p,
        points: p.points + winnerPoints,
        wins: p.wins + 1,
        streak: p.streak >= 0 ? p.streak + 1 : 1,
      };
      if (p.id === loserId) return {
        ...p,
        points: Math.max(0, p.points + loserPoints),
        losses: p.losses + 1,
        streak: p.streak <= 0 ? p.streak - 1 : -1,
      };
      return p;
    });
    setPlayers(newPlayers);

    const updatedMatch = { ...matches.find(m => m.id === matchId), status: 'completed', winnerId, score: scoreStr, sets, date: new Date().toISOString().slice(0,10), winnerChange: winnerPoints, loserChange: loserPoints, change: winnerId === currentUserId ? winnerPoints : loserPoints };
    setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));

    // Sync to Supabase
    await syncMatch(updatedMatch);
    const updatedWinner = newPlayers.find(p => p.id === winnerId);
    const updatedLoser = newPlayers.find(p => p.id === loserId);
    if (updatedWinner) await syncPlayer(updatedWinner);
    if (updatedLoser) await syncPlayer(updatedLoser);

    // Email both players
    const winner = find(players, winnerId);
    const loser = find(players, loserId);
    const emailBoth = async (recipient, isWinner) => {
      if (!recipient?.email) return;
      await sendEmail({
        to: recipient.email,
        subject: isWinner ? `🎾 Match result: You won!` : `🎾 Match result recorded`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #C4522A;">${isWinner ? '🏆 You won!' : 'Match result recorded'}</h2>
            <p>A match result has been submitted on <strong>Los Feliz Tennis Club</strong>.</p>
            <table style="margin: 16px 0; border-collapse: collapse;">
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">🏆 Winner</td><td><strong>${winner?.name}</strong></td></tr>
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">📊 Score</td><td><strong>${scoreStr}</strong></td></tr>
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">✨ Points</td><td><strong>${isWinner ? `+${winnerPoints}` : `+${loserPoints}`} pts</strong></td></tr>
            </table>
            <p>Log in to <a href="https://baseline-alpha.vercel.app" style="color: #C4522A;">Baseline</a> to view the updated ladder.</p>
            <p style="color: #7A6548; font-size: 13px;">— The Los Feliz Tennis Club Team</p>
          </div>
        `,
      });
    };
    await emailBoth(winner, true);
    await emailBoth(loser, false);

    showToast(winnerId === currentUserId ? `Won! +${winnerPoints} pts` : loserId === currentUserId ? `+${loserPoints} pts earned` : 'Score saved');
  };

  const me = find(players, currentUserId);
  const myRank = rankOf(players, currentUserId);
  const ranked = useMemo(() => {
    const streakMap = {};
    players.forEach(p => {
      const myMatches = matches
        .filter(m => m.status === 'completed' && (m.a === p.id || m.b === p.id))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      let wins = 0, losses = 0;
      for (const m of myMatches) {
        if (m.winnerId === p.id) { if (losses === 0) wins++; else break; }
        else { if (wins === 0) losses++; else break; }
      }
      const recentForm = myMatches.slice(0, 5).map(m => m.winnerId === p.id ? 'W' : 'L');
      streakMap[p.id] = { wins, losses, recentForm };
    });
    return rank(players).map(p => ({
      ...p,
      liveStreak: streakMap[p.id]?.wins || 0,
      lossStreak: streakMap[p.id]?.losses || 0,
      recentForm: streakMap[p.id]?.recentForm || [],
    }));
  }, [players, matches]);

  if (!loggedIn || !me) {
    return <LoginScreen players={players} passwords={passwords} onLogin={handleLogin} />;
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: '#E8DCC8',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: C.ink,
      }}
    >
      <PaperTexture />

      <div className="relative max-w-md mx-auto pb-32" style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}>
        <Header />

        <div className="px-5">
          {tab === 'ladder' && (
            <LadderView ranked={ranked} matches={matches} myId={currentUserId} isAdmin={isAdmin()} onViewProfile={(player) => setModal({ kind: 'playerDetail', payload: player })} onToggleActive={togglePlayerActive} onChallenge={(opp) => setModal({ kind: 'challenge', payload: opp })} />
          )}
          {tab === 'matches' && (
            <MatchesView
              matches={matches}
              players={players}
              myId={currentUserId}
              onAccept={acceptMatch}
              onDecline={declineMatch}
              onCancel={cancelMatch}
              onReport={(m) => setModal({ kind: 'report', payload: m })}
              onChallenge={(opp) => setModal({ kind: 'challenge', payload: opp })}
              onDelete={deleteMatch}
              onViewProfile={(player) => setModal({ kind: 'playerDetail', payload: player })}
            />
          )}
          {tab === 'contacts' && (
            <ContactsView players={players} myId={currentUserId} isAdmin={isAdmin()} canManagePasswords={canManagePasswords()} onResetPassword={resetUserPassword} onViewProfile={(player) => setModal({ kind: 'playerDetail', payload: player })} onToggleActive={togglePlayerActive} />
          )}
          {tab === 'profile' && (
            <ProfileView me={me} myRank={myRank} matches={matches} players={players} onChangePassword={changePassword} onUpdateProfile={updateProfile} onDeleteMatch={deleteMatch} isAdmin={isAdmin()} onReset={reset} onSignOut={handleSignOut} />
          )}
        </div>
      </div>

      <BottomTabs tab={tab} setTab={setTab} pendingCount={matches.filter(m => m.status === 'scheduled' && (m.a === currentUserId || m.b === currentUserId)).length} />

      {modal?.kind === 'challenge' && (
        <ChallengeModal
          opponent={modal.payload}
          me={me}
          onClose={() => setModal(null)}
          onSubmit={(data) => { proposeChallenge(data); setModal(null); }}
        />
      )}
      {modal?.kind === 'report' && (
        <ReportModal
          match={modal.payload}
          players={players}
          myId={currentUserId}
          onClose={() => setModal(null)}
          onSubmit={(data) => { reportScore(data); setModal(null); }}
        />
      )}
      {modal?.kind === 'playerDetail' && (
        <PlayerDetailModal
          player={modal.payload}
          players={players}
          matches={matches}
          myId={currentUserId}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}

/* ============================================================
   PAPER TEXTURE BACKGROUND
   ============================================================ */
function PaperTexture() {
  return (
    <>
      {/* Beige base */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: '#E8DCC8' }} />
      {/* Paper grain — warm tone */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.55,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0.9 0.1 0 0 0.05 0.1 0.8 0.05 0 0.02 0 0.05 0.7 0 0 0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
        }}
      />
      {/* Warm vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 50%, rgba(160,110,60,0.12) 100%)' }}
      />
      {/* Faint court lines */}
      <svg className="fixed inset-0 pointer-events-none w-full h-full" style={{ opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#7A5C30" strokeWidth="3"/>
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#7A5C30" strokeWidth="1.5"/>
        <line x1="50%" y1="0" x2="50%" y2="35%" stroke="#7A5C30" strokeWidth="1.5"/>
      </svg>
    </>
  );
}

/* ============================================================
   BASELINE LOGO
   ============================================================ */
function BaselineLogo({ size = 36 }) {
  return (
    <img
      src="data:image/png;base64,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"
      alt="Los Feliz Tennis Club"
      style={{ height: size * 2.5, width: 'auto', objectFit: 'contain' }}
    />
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header() {
  return (
    <div className="relative">
      <div className="relative px-5 pt-20 pb-16 overflow-hidden" style={{ background: 'transparent' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.35 }} preserveAspectRatio="none">
          {/* Court boundary */}
          <rect x="3%" y="10%" width="94%" height="80%" fill="none" stroke={C.clay} strokeWidth="2.5"/>
          {/* Net — extends well beyond court */}
          <line x1="50%" y1="-10%" x2="50%" y2="110%" stroke={C.clay} strokeWidth="3"/>
          {/* Service lines */}
          <line x1="27%" y1="10%" x2="27%" y2="90%" stroke={C.clay} strokeWidth="1.5"/>
          <line x1="73%" y1="10%" x2="73%" y2="90%" stroke={C.clay} strokeWidth="1.5"/>
          {/* Center service line */}
          <line x1="27%" y1="50%" x2="73%" y2="50%" stroke={C.clay} strokeWidth="1.5"/>
        </svg>
        <div className="absolute inset-0 flex items-center pointer-events-none" style={{ left: '3%', width: '47%' }}>
          <div className="w-full flex justify-center">
            <BaselineLogo size={36} />
          </div>
        </div>
        <div style={{ height: 36 }} />
      </div>
    </div>
  );
}

function ClubCrest({ size = 32 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      {/* Crossed rackets */}
      <line x1="14" y1="14" x2="34" y2="30" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="14" x2="14" y2="30" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
      {/* Ball */}
      <circle cx="24" cy="13" r="3.5" fill={C.optic} />
      <path d="M21.5 13 Q24 10.5, 26.5 13" fill="none" stroke="white" strokeWidth="0.8"/>
      {/* TC letters */}
      <text x="24" y="27" textAnchor="middle" fontFamily="serif" fontSize="10" fontWeight="700" fill="white" opacity="0.9">TC</text>
    </svg>
  );
}

function StreakBadge({ streak }) {
  if (streak === 0) return null;
  const isWin = streak > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.1em]"
      style={{
        background: isWin ? C.optic : 'rgba(0,0,0,0.2)',
        color: isWin ? C.clayDeep : 'rgba(255,255,255,0.8)',
        fontFamily: '"JetBrains Mono", monospace',
        border: isWin ? 'none' : '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {isWin ? '▲' : '▼'} {Math.abs(streak)} {isWin ? 'W' : 'L'}
    </span>
  );
}

/* ============================================================
   LADDER VIEW
   ============================================================ */
function LadderView({ ranked, matches, myId, isAdmin, onViewProfile, onToggleActive, onChallenge }) {
  const [showInactive, setShowInactive] = useState(false);

  const visiblePlayers = useMemo(() => {
    if (isAdmin && showInactive) return ranked;
    return ranked.filter(p => p.isActive !== false);
  }, [ranked, isAdmin, showInactive]);

  const hasOpenWith = (oppId) => matches.some(m =>
    m.status === 'scheduled' &&
    ((m.a === myId && m.b === oppId) || (m.b === myId && m.a === oppId))
  );

  const inactiveCount = ranked.filter(p => p.isActive === false).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeading kicker="Standings" title="Ladder" />
        {isAdmin && inactiveCount > 0 && (
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded"
            style={{ color: showInactive ? C.clay : C.inkMute, border: `1px solid ${showInactive ? C.clay : C.line}` }}
          >
            {showInactive ? `Hide ${inactiveCount}` : `Show ${inactiveCount} hidden`}
          </button>
        )}
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.88)', border: `1.5px solid ${C.parchmentDeep}` }}
      >
        {visiblePlayers.map((p, idx) => {
          const realRank = ranked.findIndex(r => r.id === p.id) + 1;
          const isMe = p.id === myId;
          return (
            <PlayerRow
              key={p.id}
              player={p}
              rank={realRank}
              isMe={isMe}
              isAdmin={isAdmin}
              matches={matches}
              onViewProfile={() => onViewProfile(p)}
              onToggleActive={() => onToggleActive(p.id)}
              onChallenge={!isMe ? () => onChallenge(p) : null}
              hasOpen={!isMe && hasOpenWith(p.id)}
              isLast={idx === visiblePlayers.length - 1}
            />
          );
        })}
      </div>

      <div className="mt-4 text-[11px] leading-relaxed" style={{ color: C.inkMute }}>
        <span style={{ color: C.clay, fontWeight: 600 }}>How it works.</span> Challenge anyone on the ladder.
        Everyone earns <strong>1 pt</strong> for playing, <strong>1 pt per set won</strong>, and a
        <strong> bonus pt</strong> for winning in straight sets. Rankings are decided by total points accumulated.
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full transition-all"
      style={{
        background: active ? C.ink : 'transparent',
        color: active ? C.parchment : C.inkMute,
        border: `1px solid ${active ? C.ink : C.line}`,
      }}
    >
      {children}
    </button>
  );
}

function PlayerRow({ player, rank, isMe, isAdmin, matches, onViewProfile, onToggleActive, onChallenge, hasOpen, isLast }) {
  const isHidden = player.isActive === false;
  const podiumBg = rank === 1 ? 'rgba(232,201,58,0.12)' : rank === 2 ? 'rgba(180,180,190,0.12)' : rank === 3 ? 'rgba(180,120,60,0.10)' : null;
  const rankColor = rank === 1 ? C.opticDeep : rank === 2 ? '#7A8090' : rank === 3 ? '#8B6020' : C.inkMute;

  return (
    <div
      className="flex items-center gap-3 pr-4 pl-2 py-4"
      style={{
        background: isMe ? `${C.optic}30` : isHidden ? `${C.inkMute}10` : (podiumBg || 'transparent'),
        borderBottom: isLast ? 'none' : `1px solid ${C.parchmentDeep}`,
        opacity: isHidden ? 0.55 : 1,
      }}
    >
      <div
        style={{
          fontFamily: '"Fraunces", serif',
          fontWeight: 900,
          fontSize: 15,
          color: rankColor,
          fontVariantNumeric: 'tabular-nums',
          width: 22,
          textAlign: 'right',
          lineHeight: 1,
        }}
      >
        {rank}
      </div>
      <button onClick={onViewProfile} className="flex-shrink-0" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        {player.profileImage ? (
          <img
            src={player.profileImage}
            alt={player.name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.line}` }}
          />
        ) : (
          <Avatar name={player.name} size={56} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-1 mb-0.5 min-w-0">
          <button
            onClick={onViewProfile}
            className="font-bold truncate"
            style={{ fontSize: 15, color: C.ink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: '"Fraunces", serif', minWidth: 0 }}
          >
            {player.name}{isMe && <span style={{ color: C.clay, fontWeight: 600 }}> · you</span>}
          </button>
          {player.liveStreak >= 3 && <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>🔥</span>}
          {player.lossStreak >= 3 && <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>🥶</span>}
        </div>
        {/* Stats row */}
        <div className="flex items-start gap-3">
          {player.ustaRating && (
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: C.optic, color: C.ink, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
              {player.ustaRating}
            </span>
          )}
          <div>
            <div style={{ fontSize: 9, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, lineHeight: 1 }}>Pts</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: C.clay, fontWeight: 700, lineHeight: 1.2 }}>{player.points}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, lineHeight: 1 }}>W–L</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: C.ink, fontWeight: 700, lineHeight: 1.2 }}>{player.wins}–{player.losses}</div>
          </div>
          {player.recentForm && player.recentForm.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, lineHeight: 1 }}>Run</div>
              <div className="flex items-center gap-0.5" style={{ height: 16, marginTop: 1 }}>
                {player.recentForm.map((result, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: result === 'W' ? C.win : C.loss,
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isMe && !isHidden && onChallenge && (
          hasOpen ? (
            <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 rounded flex-shrink-0" style={{ color: C.inkMute, border: `1px solid ${C.line}` }}>
              Pending
            </span>
          ) : (
            <button
              onClick={onChallenge}
              className="text-[9px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded flex-shrink-0"
              style={{ background: C.clay, color: 'white', whiteSpace: 'nowrap' }}
            >
              Challenge
            </button>
          )
        )}
      </div>
    </div>
  );
}

function Avatar({ name, size = 32 }) {
  const bg = '#F5C842';
  const text = initials(name);
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, borderRadius: '50%' }}
    >
      <circle cx={r} cy={r} r={r} fill={bg} />
      <text
        x="50%" y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={C.clayDeep}
        fontSize={size * 0.38}
        fontFamily='"Fraunces", serif'
        fontWeight="700"
        letterSpacing="0.03em"
      >
        {text}
      </text>
    </svg>
  );
}

/* ============================================================
   MATCHES VIEW
   ============================================================ */
function MatchesView({ matches, players, myId, onAccept, onDecline, onCancel, onReport, onChallenge, onDelete, onViewProfile }) {
  const [sub, setSub] = useState('open');
  const [search, setSearch] = useState('');

  const myMatches = matches.filter(m => m.a === myId || m.b === myId);
  const open = myMatches.filter(m => m.status === 'scheduled');
  const history = myMatches.filter(m => m.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));

  const visible = sub === 'open' ? open : history;

  const hasOpenWith = (oppId) => myMatches.some(m =>
    m.status === 'scheduled' &&
    ((m.a === myId && m.b === oppId) || (m.b === myId && m.a === oppId))
  );

  const searchResults = search.trim().length > 0
    ? players.filter(p =>
        p.id !== myId &&
        p.isActive !== false &&
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div>
      <SectionHeading kicker="Your fixtures" title="Matches" />

      {/* Player search to challenge */}
      <div className="mb-4 relative">
        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.inkMute, pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search players to challenge..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '13px 12px 13px 36px',
            border: `1.5px solid ${search ? C.clay : C.line}`,
            borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.90)', color: C.ink,
            outline: 'none',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden" style={{ border: `1.5px solid ${C.parchmentDeep}` }}>
          {searchResults.map((p, idx) => {
            const alreadyChallenged = hasOpenWith(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.90)',
                  borderBottom: idx < searchResults.length - 1 ? `1px solid ${C.line}` : 'none',
                }}
              >
                <Avatar name={p.name} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 14, fontFamily: '"Fraunces", serif', color: C.ink }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>
                    {p.points} pts · {p.wins}–{p.losses}
                  </div>
                </div>
                {alreadyChallenged ? (
                  <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: C.inkMute }}>Open match</span>
                ) : (
                  <button
                    onClick={() => { onChallenge(p); setSearch(''); }}
                    className="text-[10px] uppercase tracking-[0.12em] font-bold px-3 py-1.5 rounded"
                    style={{ background: C.clay, color: 'white' }}
                  >
                    Challenge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {search.trim().length > 0 && searchResults.length === 0 && (
        <div className="mb-4 rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.5)', border: `1px solid ${C.line}` }}>
          <div className="text-[12px]" style={{ color: C.inkMute }}>No players found</div>
        </div>
      )}

      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: C.parchmentWarm }}>
        {[
          { id: 'open', label: 'Challenges', count: open.length },
          { id: 'history', label: 'History', count: history.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className="flex-1 text-[11px] uppercase tracking-[0.12em] font-semibold py-2 rounded transition-all"
            style={{
              background: sub === t.id ? C.ink : 'transparent',
              color: sub === t.id ? C.parchment : C.inkMute,
            }}
          >
            {t.label} {t.count > 0 && <span style={{ opacity: 0.7 }}>· {t.count}</span>}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <EmptyState
          icon={<Activity size={20} />}
          title={sub === 'open' ? 'No challenges' : 'No matches yet'}
          subtitle={sub === 'history' ? 'Your match history will live here.' : 'Search for a player above or head to the ladder to challenge someone.'}
        />
      )}

      <div className="space-y-3">
        {visible.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            players={players}
            myId={myId}
            onAccept={() => onAccept(m.id)}
            onDecline={() => onDecline(m.id)}
            onCancel={() => onCancel(m.id)}
            onReport={() => onReport(m)}
            onDelete={() => onDelete(m.id)}
          />
        ))}
      </div>

      {/* Club-wide activity feed */}
      <div className="mt-6">
        <div className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: C.inkMute }}>
          Club Activity
        </div>
        <ActivityView matches={matches} players={players} onViewProfile={onViewProfile} />
      </div>
    </div>
  );
}

function MatchCard({ match, players, myId, onAccept, onDecline, onCancel, onReport, onDelete }) {
  const opponent = match.a === myId ? find(players, match.b) : find(players, match.a);

  if (match.status === 'completed') {
    const won = match.winnerId === myId;
    const ranked = rank(players);
    const oppRank = ranked.findIndex(p => p.id === opponent?.id) + 1;
    return (
      <div
        className="rounded-lg px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: `1px solid ${C.line}`,
          borderLeft: `4px solid ${won ? C.win : C.loss}`,
        }}
      >
        {/* Top row: W/L + opponent + delete */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase flex-shrink-0" style={{ color: won ? C.win : C.loss }}>{won ? 'W' : 'L'}</span>
            <span className="text-[14px] font-semibold truncate" style={{ fontFamily: '"Fraunces", serif', color: C.ink }}>{opponent?.name}</span>
            <span className="text-[11px] flex-shrink-0" style={{ color: C.inkMute }}>#{oppRank}</span>
          </div>
          <button
            onClick={() => onDelete()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: '4px', flexShrink: 0 }}
          >
            <X size={13} />
          </button>
        </div>
        {/* Bottom row: score + pts + date */}
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.inkMute }}>{match.score}</span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold" style={{ color: won ? C.win : C.loss }}>{won ? '+' : ''}{match.change} pts</span>
            <span className="text-[11px]" style={{ color: C.inkMute }}>{fmtDate(match.date)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (match.status === 'pending' || match.status === 'scheduled') {
    return (
      <div
        className="rounded-lg p-4"
        style={{ background: 'rgba(255,255,255,0.88)', border: `1.5px solid ${C.clay}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.clay }}>
            Challenge
          </span>
          <span className="text-[10px]" style={{ color: C.inkMute }}>
            {fmtDate(match.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Avatar name={opponent.name} size={44} />
          <div className="flex-1">
            <div className="font-semibold text-sm">{opponent.name}</div>
            <div className="text-[11px]" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>
              {opponent.points} pts · {opponent.wins}–{opponent.losses}
            </div>
          </div>
        </div>
        {(match.proposedDate || match.location) && (
          <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: C.inkMute }}>
            {match.proposedDate && <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDateTime(match.proposedDate)}</span>}
            {match.location && <span className="flex items-center gap-1"><MapPin size={11} /> {match.location}</span>}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onReport}
            className="flex-1 text-[12px] font-semibold py-2 rounded uppercase tracking-[0.1em]"
            style={{ background: C.ink, color: C.parchment }}
          >
            Report Score
          </button>
          <button
            onClick={onCancel}
            className="text-[12px] font-semibold py-2 px-3 rounded uppercase tracking-[0.1em]"
            style={{ background: 'transparent', color: C.inkMute, border: `1px solid ${C.line}` }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // scheduled
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: C.ink,
        color: C.parchment,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.optic }}>
          Match on
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {fmtDateTime(match.proposedDate)}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Avatar name={opponent.name} size={44} />
        <div className="flex-1">
          <div className="font-semibold text-sm">vs {opponent.name}</div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"JetBrains Mono", monospace' }}>
            {opponent.points} pts · #{rankOf(players, opponent.id)}
          </div>
        </div>
      </div>
      <div className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <MapPin size={11} /> {match.location}
      </div>
      <button
        onClick={onReport}
        className="w-full text-[12px] font-semibold py-2 rounded uppercase tracking-[0.1em]"
        style={{ background: C.optic, color: C.ink }}
      >
        Report Score
      </button>
    </div>
  );
}

/* ============================================================
   CONTACTS VIEW
   ============================================================ */
function ContactsView({ players, myId, isAdmin, canManagePasswords, onResetPassword, onViewProfile, onToggleActive }) {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  // Filter players based on search and active status
  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()));
    const matchesActive = (isAdmin && showInactive) || p.isActive !== false;
    return matchesSearch && matchesActive;
  });

  const inactiveCount = players.filter(p => p.isActive === false).length;

  const handleResetPassword = (playerEmail, playerName) => {
    if (window.confirm(`Reset password for ${playerName} to default (tennis123)?`)) {
      onResetPassword(playerEmail);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeading kicker="Club directory" title="Contacts" />
        {isAdmin && inactiveCount > 0 && (
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded"
            style={{ color: showInactive ? C.clay : C.inkMute, border: `1px solid ${showInactive ? C.clay : C.line}` }}
          >
            {showInactive ? `Hide ${inactiveCount}` : `Show ${inactiveCount} hidden`}
          </button>
        )}
      </div>

      {canManagePasswords && (
        <div className="mb-4 rounded-lg p-3" style={{ background: `${C.optic}50`, border: `1px solid ${C.opticDeep}` }}>
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: C.ink }} />
            <span className="text-[11px] font-semibold" style={{ color: C.ink }}>
              Password Manager Access
            </span>
          </div>
          <div className="text-[10px] mt-1" style={{ color: C.inkMute }}>
            You can reset passwords for any player
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.inkMute }} />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 12px 13px 36px',
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.88)',
          }}
        />
      </div>

      <div className="space-y-2">
        {filtered.map(p => {
          const isHidden = p.isActive === false;
          return (
          <div
            key={p.id}
            className="p-4 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}`, opacity: isHidden ? 0.6 : 1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => onViewProfile(p)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                {p.profileImage ? (
                  <img 
                    src={p.profileImage} 
                    alt={p.name}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.line}` }}
                  />
                ) : (
                  <Avatar name={p.name} size={40} />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewProfile(p)}
                    className="font-semibold text-sm"
                    style={{ color: C.ink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    {p.name}{p.id === myId && <span style={{ color: C.clay }}> (you)</span>}
                  </button>
                  {p.ustaRating && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.optic, color: C.ink, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                      {p.ustaRating}
                    </span>
                  )}
                  {isHidden && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: C.inkMute, color: C.parchment, fontWeight: 600 }}>
                      HIDDEN
                    </span>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: C.inkMute }}>
                  #{rankOf(players, p.id)} · {p.points} pts · {p.wins}-{p.losses}
                </div>
              </div>
            </div>
            {p.email && (
              <div className="flex items-center gap-2 mb-1">
                <Mail size={12} style={{ color: C.inkMute }} />
                <a href={`mailto:${p.email}`} className="text-[12px]" style={{ color: C.green }}>
                  {p.email}
                </a>
              </div>
            )}
            {p.phone && (
              <div className="flex items-center gap-2 mb-1">
                <Phone size={12} style={{ color: C.inkMute }} />
                <a href={`tel:${p.phone}`} className="text-[12px]" style={{ color: C.inkMute }}>
                  {p.phone}
                </a>
              </div>
            )}
            {(isAdmin || canManagePasswords) && p.id !== myId && (
              <div className="mt-2 pt-2 flex gap-2" style={{ borderTop: `1px dashed ${C.line}` }}>
                {isAdmin && (
                  <button
                    onClick={() => onToggleActive(p.id)}
                    className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded flex items-center gap-1"
                    style={{ background: C.inkMute, color: C.parchment }}
                  >
                    <User size={10} />
                    {isHidden ? 'Show' : 'Hide'}
                  </button>
                )}
                {canManagePasswords && (
                  <button
                    onClick={() => handleResetPassword(p.email, p.name)}
                    className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded flex items-center gap-1"
                    style={{ background: C.clay, color: C.parchment }}
                  >
                    <Lock size={10} />
                    Reset Password
                  </button>
                )}
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE VIEW
   ============================================================ */

function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
  const [scale, setScale] = React.useState(1);
  const [ox, setOx] = React.useState(0);
  const [oy, setOy] = React.useState(0);
  const [natW, setNatW] = React.useState(0);
  const [natH, setNatH] = React.useState(0);
  const dragRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const SIZE = 260;

  // base scale to cover the circle (object-fit: cover)
  const baseScale = natW && natH ? Math.max(SIZE / natW, SIZE / natH) : 1;
  // rendered size at scale=1
  const baseW = natW * baseScale;
  const baseH = natH * baseScale;

  const onMouseDown = (e) => { dragRef.current = { x: e.clientX, y: e.clientY, ox, oy }; };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    setOx(dragRef.current.ox + e.clientX - dragRef.current.x);
    setOy(dragRef.current.oy + e.clientY - dragRef.current.y);
  };
  const onMouseUp = () => { dragRef.current = null; };
  const onTouchStart = (e) => { const t = e.touches[0]; dragRef.current = { x: t.clientX, y: t.clientY, ox, oy }; };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    setOx(dragRef.current.ox + t.clientX - dragRef.current.x);
    setOy(dragRef.current.oy + t.clientY - dragRef.current.y);
  };
  const onTouchEnd = () => { dragRef.current = null; };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !natW || !natH) return;
    const out = document.createElement('canvas');
    out.width = 400; out.height = 400;
    const ctx = out.getContext('2d');
    ctx.beginPath(); ctx.arc(200, 200, 200, 0, Math.PI * 2); ctx.clip();
    const r = 400 / SIZE;
    const w = baseW * scale * r;
    const h = baseH * scale * r;
    ctx.drawImage(img, 200 - w / 2 + ox * r, 200 - h / 2 + oy * r, w, h);
    out.toBlob(b => b ? onConfirm(b) : onCancel(), 'image/jpeg', 0.9);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.parchment, borderRadius: 16, padding: 20, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: C.inkMute }}>Crop Photo</div>
        <div
          style={{ width: SIZE, height: SIZE, borderRadius: '50%', overflow: 'hidden', background: '#111', cursor: 'grab', userSelect: 'none', touchAction: 'none', position: 'relative', flexShrink: 0 }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <img
            ref={imgRef}
            src={imageSrc} alt="" draggable={false}
            onLoad={(e) => { setNatW(e.target.naturalWidth); setNatH(e.target.naturalHeight); }}
            style={{
              position: 'absolute',
              width: baseW,
              height: baseH,
              left: SIZE / 2 - baseW / 2,
              top: SIZE / 2 - baseH / 2,
              transform: `translate(${ox}px, ${oy}px) scale(${scale})`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.inkMute, marginBottom: 4 }}>Zoom</div>
          <input type="range" min="1" max="3" step="0.01" value={scale} onChange={e => setScale(+e.target.value)} style={{ width: '100%', accentColor: C.clay }} />
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.line}`, color: C.inkMute, background: 'transparent', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleConfirm} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, borderRadius: 8, background: C.clay, color: 'white', border: 'none', cursor: 'pointer' }}>Use Photo</button>
        </div>
      </div>
    </div>
  );
}


function ProfileView({ me, myRank, matches, players, onChangePassword, onUpdateProfile, onDeleteMatch, isAdmin, onReset, onSignOut }) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [ustaRating, setUstaRating] = useState(me.ustaRating || '');
  const [cropSrc, setCropSrc] = useState(null);

  const myCompleted = matches.filter(m => (m.a === me.id || m.b === me.id) && m.status === 'completed');
  const winRate = me.wins + me.losses === 0 ? 0 : Math.round((me.wins / (me.wins + me.losses)) * 100);
  const totalMatches = me.wins + me.losses;

  // Build point history from completed matches
  const history = useMemo(() => {
    const sorted = [...myCompleted].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    let running = 0;
    const points = sorted.map(m => {
      running += (m.change || 0);
      return { date: m.date ? m.date.slice(5) : '—', points: running };
    });
    return points.length > 0 ? points : [{ date: 'Start', points: 0 }];
  }, [myCompleted]);

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onChangePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target && ev.target.result) setCropSrc(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob) => {
    setCropSrc(null);
    try {
      const fileName = `${me.id}-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('', blob);
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/avatars/${fileName}`,
        { method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }, body: formData }
      );
      if (!uploadRes.ok) throw new Error('Upload failed');
      onUpdateProfile({ profileImage: `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}` });
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target && ev.target.result) onUpdateProfile({ profileImage: ev.target.result }); };
      reader.readAsDataURL(blob);
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ ustaRating });
    setEditingProfile(false);
  };

  return (
    <div>
      {cropSrc && <ImageCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />}
      <SectionHeading kicker="Player card" title="Your Profile" />

      {/* Inactive Status Alert */}
      {me.isActive === false && (
        <div className="mb-4 rounded-lg p-4" style={{ background: `${C.inkMute}20`, border: `2px solid ${C.inkMute}` }}>
          <div className="flex items-center gap-2 mb-2">
            <User size={16} style={{ color: C.inkMute }} />
            <span className="text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: C.inkMute }}>
              Inactive Profile
            </span>
          </div>
          <div className="text-[12px]" style={{ color: C.inkMute }}>
            This profile is currently hidden from the ladder and contacts directory. Only admins can see and re-activate this account.
          </div>
        </div>
      )}

      {/* Combined player card */}
      <div
        className="relative rounded-lg p-5 mb-4 overflow-hidden"
        style={{ background: C.green, color: C.parchment }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} preserveAspectRatio="none">
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="3"/>
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="white" strokeWidth="1.5"/>
          <line x1="50%" y1="0" x2="50%" y2="70%" stroke="white" strokeWidth="1.5"/>
        </svg>
        <div className="absolute right-0 top-0 bottom-0 opacity-15" style={{ width: 120, background: `radial-gradient(circle at center, ${C.optic} 0%, transparent 70%)` }} />

        {/* Photo + name */}
        <div className="flex items-start gap-4 mb-4 relative">
          <div className="relative flex-shrink-0">
            {me.profileImage ? (
              <img src={me.profileImage} alt={me.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
            ) : (
              <Avatar name={me.name} size={72} />
            )}
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: C.clay, color: 'white', border: '2px solid rgba(255,255,255,0.6)' }}>
              <User size={12} />
              <input id="profile-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, marginBottom: 4 }}>
              {me.name}
            </div>
            {editingProfile ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="USTA rating e.g. 4.5"
                  value={ustaRating}
                  onChange={e => setUstaRating(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, fontSize: 14, background: 'rgba(255,255,255,0.15)', color: 'white' }}
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="flex-1 py-1.5 text-[10px] font-semibold rounded uppercase tracking-[0.1em]" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Save</button>
                  <button onClick={() => { setEditingProfile(false); setUstaRating(me.ustaRating || ''); }} className="flex-1 py-1.5 text-[10px] font-semibold rounded uppercase tracking-[0.1em]" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {me.ustaRating && (
                  <span className="text-[11px] font-bold" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.optic }}>{me.ustaRating} USTA</span>
                )}
                <button onClick={() => setEditingProfile(true)} className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.7)' }}>
                  {me.ustaRating ? 'Edit' : 'Add USTA'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 relative">
          <Stat label="Rank" value={`#${myRank}`} accent={C.optic} />
          <Stat label="Points" value={me.points} mono />
          <Stat label="Win %" value={`${winRate}%`} accent={winRate >= 50 ? C.optic : C.clayLight} />
        </div>
      </div>
      <div className="mb-4 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: C.inkMute }} />
            <span className="text-[12px] font-semibold" style={{ color: C.ink }}>Password</span>
          </div>
          {!showPasswordChange && (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="text-[11px] uppercase tracking-[0.1em] px-2 py-1 rounded"
              style={{ color: C.clay, border: `1px solid ${C.clay}` }}
            >
              Change
            </button>
          )}
        </div>
        {showPasswordChange ? (
          <div className="space-y-2 mt-3">
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: C.parchmentWarm }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: C.parchmentWarm }}
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="flex-1 py-2 text-[11px] font-semibold rounded uppercase tracking-[0.1em]"
                style={{ background: C.ink, color: C.parchment }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-2 text-[11px] font-semibold rounded uppercase tracking-[0.1em]"
                style={{ border: `1px solid ${C.line}`, color: C.inkMute }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[11px]" style={{ color: C.inkMute }}>
            ••••••••
          </div>
        )}
      </div>

      <div
        className="rounded-lg p-4 mb-5"
        style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.inkMute }}>
            Points Trend
          </div>
          <div className="text-[10px]" style={{ color: C.inkMute }}>
            Last {history.length} matches
          </div>
        </div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer>
            <AreaChart data={history} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.clay} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.clay} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.inkMute }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.inkMute }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                  background: C.ink, border: 'none', borderRadius: 6,
                  color: C.parchment, fontSize: 11,
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              />
              <Area
                type="monotone" dataKey="points"
                stroke={C.clay} strokeWidth={2}
                fill="url(#grad)"
                dot={{ fill: C.clay, r: 3 }}
                activeDot={{ fill: C.clay, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: C.inkMute }}>Stats</div>
        <StatsPanel playerId={me.id} matches={matches} players={players} />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: C.inkMute }}>
          Match History
        </div>
        {myCompleted.length === 0 ? (
          <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
            <div className="text-[12px]" style={{ color: C.inkMute }}>No matches played yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {[...myCompleted].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((m, idx) => {
              const opponent = m.a === me.id ? find(players, m.b) : find(players, m.a);
              const won = m.winnerId === me.id;
              const ranked = rank(players);
              const oppRank = ranked.findIndex(p => p.id === opponent?.id) + 1;
              return (
                <div
                  key={m.id}
                  className="rounded-lg px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}`, borderLeft: `4px solid ${won ? C.win : C.loss}` }}
                >
                  {/* Top row: W/L + opponent + delete */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold uppercase flex-shrink-0" style={{ color: won ? C.win : C.loss }}>{won ? 'W' : 'L'}</span>
                      <span className="text-[14px] font-semibold truncate" style={{ fontFamily: '"Fraunces", serif', color: C.ink }}>{opponent?.name || 'Unknown'}</span>
                      <span className="text-[11px] flex-shrink-0" style={{ color: C.inkMute }}>#{oppRank}</span>
                    </div>
                    <button
                      onClick={() => onDeleteMatch(m.id)}
                      title="Delete match"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: '4px', flexShrink: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Bottom row: score + pts + date */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.inkMute }}>{m.score}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold" style={{ color: won ? C.win : C.loss }}>{won ? '+' : ''}{m.change} pts</span>
                      <span className="text-[11px]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Admin section */}
      {isAdmin && (
        <div className="mt-6 mb-4 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: C.inkMute }}>Admin</div>
          <button
            onClick={() => { if (window.confirm('Reset all data to defaults? This cannot be undone.')) onReset(); }}
            className="w-full py-2.5 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
            style={{ background: 'transparent', border: `1px solid ${C.clay}`, color: C.clay }}
          >
            Reset Ladder to Defaults
          </button>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="w-full py-3 mb-6 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
        style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.inkMute }}
      >
        Sign Out
      </button>
    </div>
  );
}

function Stat({ label, value, accent = C.parchment, mono }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? '"JetBrains Mono", monospace' : '"Fraunces", serif',
          fontWeight: 700,
          fontSize: 24,
          color: accent,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailStat({ icon, label, value, sublabel, mono, accent }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-1 mb-1" style={{ color: C.inkMute }}>
        {icon}
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold">{label}</span>
      </div>
      <div
        style={{
          fontFamily: mono ? '"JetBrains Mono", monospace' : '"Fraunces", serif',
          fontWeight: 700,
          fontSize: 22,
          color: accent || C.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: C.inkMute }}>
        {sublabel}
      </div>
    </div>
  );
}

/* ============================================================
   COMMON UI
   ============================================================ */
function SectionHeading({ kicker, title }) {
  return (
    <div className="mb-4 mt-3">
      <div className="text-[9px] uppercase tracking-[0.35em] mb-1.5" style={{ color: C.clay, fontWeight: 700 }}>
        {kicker}
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 26, lineHeight: 1, color: C.ink }}>
        {title}
      </div>
      {/* Court line underline */}
      <div className="flex items-center gap-1 mt-2">
        <div style={{ height: 3, width: 28, background: C.clay, borderRadius: 2 }} />
        <div style={{ height: 3, width: 8, background: C.optic, borderRadius: 2 }} />
        <div style={{ height: 1, flex: 1, background: C.line }} />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div
      className="rounded-lg py-10 text-center"
      style={{ background: 'rgba(255,255,255,0.82)', border: `1px dashed ${C.line}` }}
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2" style={{ background: C.parchmentWarm, color: C.inkMute }}>
        {icon}
      </div>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-[12px]" style={{ color: C.inkMute }}>{subtitle}</div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 text-[12px] font-bold z-50 uppercase tracking-[0.15em]"
      style={{
        background: C.clay,
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        animation: 'toast-in 0.25s ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   ACTIVITY VIEW — club-wide match feed
   ============================================================ */
function ActivityView({ matches, players, onViewProfile }) {
  const completed = [...matches]
    .filter(m => m.status === 'completed')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const ranked = rank(players);
  const getRank = (id) => ranked.findIndex(p => p.id === id) + 1;

  if (completed.length === 0) return (
    <div className="text-[12px] text-center py-4" style={{ color: C.inkMute }}>No matches played yet</div>
  );

  return (
    <div className="space-y-2">
      {completed.map(m => {
        const winner = find(players, m.winnerId);
        const loserId = m.a === m.winnerId ? m.b : m.a;
        const loser = find(players, loserId);
        if (!winner || !loser) return null;
        const wRank = getRank(winner.id);
        const lRank = getRank(loser.id);
        return (
          <div key={m.id} className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
            {/* Date + score on one line */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.ink, background: C.parchmentWarm, whiteSpace: 'nowrap' }}>{m.score}</span>
            </div>
            {/* Players row */}
            <div className="flex items-center justify-between gap-2">
              {/* Winner */}
              <button onClick={() => onViewProfile(winner)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                {winner.profileImage
                  ? <img src={winner.profileImage} alt={winner.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.win}` }} />
                  : <Avatar name={winner.name} size={36} />
                }
                <div className="text-left min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 12, fontFamily: '"Fraunces", serif', color: C.ink }}>{winner.name}</div>
                  <div style={{ fontSize: 10, color: C.win, fontWeight: 700 }}>#{wRank} · W</div>
                </div>
              </button>

              <div className="text-[10px] font-bold flex-shrink-0" style={{ color: C.line }}>vs</div>

              {/* Loser */}
              <button onClick={() => onViewProfile(loser)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                <div className="text-right min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 12, fontFamily: '"Fraunces", serif', color: C.ink }}>{loser.name}</div>
                  <div style={{ fontSize: 10, color: C.loss, fontWeight: 700 }}>#{lRank} · L</div>
                </div>
                {loser.profileImage
                  ? <img src={loser.profileImage} alt={loser.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.loss}` }} />
                  : <Avatar name={loser.name} size={36} />
                }
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   BOTTOM TABS
   ============================================================ */
function BottomTabs({ tab, setTab, pendingCount }) {
  const PodiumIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {/* Cup body */}
      <path d="M5 2 H15 L13.5 11 Q13 14, 10 14 Q7 14, 6.5 11 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" strokeLinejoin="round"/>
      {/* Handles */}
      <path d="M5 4 Q2 4, 2 7 Q2 10, 5 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M15 4 Q18 4, 18 7 Q18 10, 15 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Stem */}
      <line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Base */}
      <line x1="7" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  // Two rackets crossed in an X — clearer design
  const RacketsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Racket 1: tilted left (top-right to bottom-left) */}
      {/* Head */}
      <ellipse cx="15.5" cy="5.5" rx="4" ry="5" stroke="currentColor" strokeWidth="1.5" transform="rotate(35 15.5 5.5)"/>
      {/* Strings horizontal */}
      <line x1="12.5" y1="4" x2="17.5" y2="5.5" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(35 15 5)"/>
      <line x1="12" y1="6" x2="18" y2="7" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(35 15 5)"/>
      {/* Handle */}
      <line x1="13" y1="9" x2="5" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

      {/* Racket 2: tilted right (top-left to bottom-right) */}
      {/* Head */}
      <ellipse cx="6.5" cy="5.5" rx="4" ry="5" stroke="currentColor" strokeWidth="1.5" transform="rotate(-35 6.5 5.5)"/>
      {/* Strings horizontal */}
      <line x1="3.5" y1="4" x2="8.5" y2="5.5" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(-35 7 5)"/>
      <line x1="3" y1="6" x2="9" y2="7" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(-35 7 5)"/>
      {/* Handle */}
      <line x1="9" y1="9" x2="17" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const TennisBallIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.35" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3.5 4.5 C6 7, 6 13, 3.5 15.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M16.5 4.5 C14 7, 14 13, 16.5 15.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );

  // Multiple people icon
  const ContactsIcon = () => (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="currentColor">
      {/* Back person - left */}
      <circle cx="7" cy="5" r="2.8" opacity="0.6"/>
      <path d="M1 17 Q1 11, 7 11 Q10 11, 11 13" opacity="0.6"/>
      {/* Back person - right */}
      <circle cx="15" cy="5" r="2.8" opacity="0.6"/>
      <path d="M21 17 Q21 11, 15 11 Q12 11, 11 13" opacity="0.6"/>
      {/* Front person - center */}
      <circle cx="11" cy="4.5" r="3.2"/>
      <path d="M4 18 Q4 11.5, 11 11.5 Q18 11.5, 18 18"/>
    </svg>
  );

  const tabs = [
    { id: 'ladder',   label: 'Ladder',   icon: <PodiumIcon /> },
    { id: 'matches',  label: 'Matches',  icon: <RacketsIcon />, badge: pendingCount },
    { id: 'contacts', label: 'Contacts', icon: <ContactsIcon /> },
    { id: 'profile',  label: 'Profile',  icon: <TennisBallIcon /> },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto"
      style={{
        background: C.ink,
        borderTop: `3px solid ${C.clay}`,
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      }}
    >
      <div className="flex justify-around px-2 pt-2 pb-1">
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 transition-all"
              style={{ color: active ? C.optic : 'rgba(255,255,255,0.4)' }}
            >
              {active && (
                <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: C.optic, borderRadius: '0 0 3px 3px' }} />
              )}
              <div className="relative">
                {t.icon}
                {t.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                    style={{ background: C.clay, color: 'white' }}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   STATS PANEL — shared by ProfileView and PlayerDetailModal
   ============================================================ */
function StatsPanel({ playerId, matches, players }) {
  const s = calcStats(playerId, matches, players);

  if (s.played === 0) return (
    <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
      <div className="text-[12px]" style={{ color: C.inkMute }}>No matches played yet</div>
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Top row: matches */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Played',    value: s.played,            color: C.ink },
          { label: 'Win Rate',  value: `${s.winRate}%`,     color: s.winRate >= 50 ? C.win : C.loss },
          { label: 'Won',       value: s.matchWins,         color: C.win },
          { label: 'Lost',      value: s.matchLosses,       color: C.loss },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div className="text-[9px] uppercase tracking-[0.12em] mt-1" style={{ color: C.inkMute }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Sets row */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Sets</div>
        <div className="flex items-center gap-3">
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.win }}>{s.setsWon}</div>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: C.line }}>
            {s.setsWon + s.setsLost > 0 && (
              <div style={{ height: '100%', width: `${Math.round((s.setsWon / (s.setsWon + s.setsLost)) * 100)}%`, background: C.win, borderRadius: 9999 }} />
            )}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.loss }}>{s.setsLost}</div>
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: C.inkMute }}>
          <span>Won</span><span>Lost</span>
        </div>
      </div>

      {/* Games row */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Games</div>
        <div className="flex items-center gap-3">
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.win }}>{s.gamesWon}</div>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: C.line }}>
            {s.gamesWon + s.gamesLost > 0 && (
              <div style={{ height: '100%', width: `${Math.round((s.gamesWon / (s.gamesWon + s.gamesLost)) * 100)}%`, background: C.green, borderRadius: 9999 }} />
            )}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.loss }}>{s.gamesLost}</div>
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: C.inkMute }}>
          <span>Won</span><span>Lost</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PLAYER DETAIL MODAL
   ============================================================ */
function PlayerDetailModal({ player, players, matches, myId, onClose }) {
  const playerRank = rankOf(players, player.id);
  const isHidden = player.isActive === false;
  const playerMatches = matches.filter(m =>
    (m.a === player.id || m.b === player.id) && m.status === 'completed'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-5 pb-8 relative"
        style={{ background: C.parchment, maxHeight: '90vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', animation: 'slide-up 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: C.line }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <X size={20} style={{ color: C.inkMute }} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {player.profileImage
            ? <img src={player.profileImage} alt={player.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.clay}`, flexShrink: 0 }} />
            : <Avatar name={player.name} size={72} />
          }
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>{player.name}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: C.inkMute }}>Rank #{playerRank} · {player.points} pts</span>
              {player.ustaRating && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.optic, color: C.ink, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                  USTA {player.ustaRating}
                </span>
              )}
            </div>
            
          </div>
        </div>

        {/* Inactive badge */}
        {isHidden && (
          <div className="mb-4 rounded-lg p-3" style={{ background: `${C.inkMute}20`, border: `2px solid ${C.inkMute}` }}>
            <div className="flex items-center gap-2 mb-1">
              <User size={13} style={{ color: C.inkMute }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: C.inkMute }}>Inactive Profile</span>
            </div>
            <div className="text-[10px]" style={{ color: C.inkMute }}>Hidden from the ladder and contacts directory.</div>
          </div>
        )}

        {/* Contact */}
        {(player.email || player.phone) && (
          <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
            <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Contact</div>
            {player.email && (
              <div className="flex items-center gap-2 mb-1">
                <Mail size={12} style={{ color: C.inkMute }} />
                <a href={`mailto:${player.email}`} className="text-[12px]" style={{ color: C.green }}>{player.email}</a>
              </div>
            )}
            {player.phone && (
              <div className="flex items-center gap-2">
                <Phone size={12} style={{ color: C.inkMute }} />
                <a href={`tel:${player.phone}`} className="text-[12px]" style={{ color: C.inkMute }}>{player.phone}</a>
              </div>
            )}
          </div>
        )}

        {/* Full stats */}
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Stats</div>
        <StatsPanel playerId={player.id} matches={matches} players={players} />

        {/* Match history */}
        {playerMatches.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>
              Match History
            </div>
            <div className="space-y-1">
              {[...playerMatches].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(m => {
                const won = m.winnerId === player.id;
                const oppId = m.a === player.id ? m.b : m.a;
                const opp = find(players, oppId);
                const oppRank = rank(players).findIndex(p => p.id === oppId) + 1;
                return (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}`, borderLeft: `3px solid ${won ? C.win : C.loss}` }}>
                    <span className="text-[10px] font-bold flex-shrink-0 w-3" style={{ color: won ? C.win : C.loss }}>{won ? 'W' : 'L'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-semibold truncate" style={{ color: C.ink }}>{opp?.name || 'Unknown'}</span>
                      <span className="text-[10px] ml-1" style={{ color: C.inkMute }}>#{oppRank}</span>
                    </div>
                    <div className="text-[10px] flex-shrink-0" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>{m.score}</div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-bold" style={{ color: won ? C.win : C.loss }}>{won ? '+' : ''}{m.change}</div>
                      <div className="text-[9px]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CHALLENGE MODAL
   ============================================================ */
function ChallengeModal({ opponent, me, onClose, onSubmit }) {
  const [date, setDate] = useState(() => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    d.setMinutes(Math.round(d.getMinutes() / 15) * 15, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [location, setLocation] = useState(VENUES[0]);
  const [customLocation, setCustomLocation] = useState('');

  const finalLocation = location === 'Other' ? customLocation : location;

  return (
    <ModalShell onClose={onClose}>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: C.clay }}>
        New Challenge
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 24, lineHeight: 1.1, color: C.ink }} className="mb-4">
        vs {opponent.name}
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 rounded" style={{ background: C.parchmentWarm }}>
        <Avatar name={opponent.name} size={40} />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.inkMute }}>Points</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: C.ink }}>{opponent.points} pts</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.inkMute }}>Record</div>
          <div className="font-semibold text-sm">{opponent.wins}–{opponent.losses}</div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-1.5" style={{ color: C.inkMute }}>
            When
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded text-sm"
            style={{ background: C.parchmentWarm, border: `1px solid ${C.line}`, color: C.ink, fontFamily: '"DM Sans", sans-serif' }}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-1.5" style={{ color: C.inkMute }}>
            Where
          </label>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-3 py-2.5 rounded text-sm"
            style={{ background: C.parchmentWarm, border: `1px solid ${C.line}`, color: C.ink, fontFamily: '"DM Sans", sans-serif' }}
          >
            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {location === 'Other' && (
            <input
              type="text"
              placeholder="Enter location..."
              value={customLocation}
              onChange={e => setCustomLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded text-sm mt-2"
              style={{ background: C.parchmentWarm, border: `1px solid ${C.line}`, color: C.ink, fontFamily: '"DM Sans", sans-serif' }}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${C.line}`, color: C.inkMute }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ opponentId: opponent.id, date, location: finalLocation })}
          className="flex-1 py-3 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
          style={{ background: C.clay, color: 'white' }}
        >
          Send Challenge
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   REPORT SCORE MODAL
   ============================================================ */
function ReportModal({ match, players, myId, onClose, onSubmit }) {
  const playerA = find(players, match.a);
  const playerB = find(players, match.b);
  const myPlayer = find(players, myId);
  const [sets, setSets] = useState([{ a: 0, b: 0 }, { a: 0, b: 0 }, null]);
  const [thirdSetType, setThirdSetType] = useState('full');
  const [tiebreaks, setTiebreaks] = useState({ 0: null, 1: null });

  const updateSet = (idx, who, val) => {
    const is3rdTiebreak = idx === 2 && thirdSetType === 'tiebreak';
    const maxVal = is3rdTiebreak ? 10 : 7;
    const v = Math.max(0, Math.min(maxVal, Number(val)));
    const newSets = [...sets];
    if (!newSets[idx]) newSets[idx] = { a: 0, b: 0 };
    const updated = { ...newSets[idx], [who]: v };
    newSets[idx] = updated;
    setSets(newSets);
    if (!is3rdTiebreak && !(updated.a === 6 && updated.b === 6)) {
      setTiebreaks(prev => ({ ...prev, [idx]: null }));
    }
  };

  const updateTiebreak = (idx, who, val) => {
    setTiebreaks(prev => ({
      ...prev,
      [idx]: { ...(prev[idx] || { a: 0, b: 0 }), [who]: Math.max(0, Number(val)) },
    }));
  };

  const validSets = sets.filter(s => s !== null);

  const setWinner = (s, idx) => {
    if (!s) return null;
    if (s.a === 6 && s.b === 6) {
      const tb = tiebreaks[idx];
      if (!tb) return null;
      if (tb.a >= 7 && tb.a - tb.b >= 2) return 'a';
      if (tb.b >= 7 && tb.b - tb.a >= 2) return 'b';
      return null;
    }
    if (s.a > s.b) return 'a';
    if (s.b > s.a) return 'b';
    return null;
  };

  const setsWonA = validSets.filter((s, i) => setWinner(s, i) === 'a').length;
  const setsWonB = validSets.filter((s, i) => setWinner(s, i) === 'b').length;
  const winnerSide = setsWonA > setsWonB ? 'a' : setsWonB > setsWonA ? 'b' : null;
  const winnerId = winnerSide === 'a' ? match.a : winnerSide === 'b' ? match.b : null;

  const w1 = setWinner(sets[0], 0);
  const w2 = setWinner(sets[1], 1);
  const firstTwoSplit = w1 && w2 && w1 !== w2;

  useEffect(() => {
    if (!firstTwoSplit && sets[2] !== null) {
      setSets(prev => { const n = [...prev]; n[2] = null; return n; });
    }
  }, [firstTwoSplit]);

  const resolvedSets = validSets.map((s, i) => {
    if (s.a === 6 && s.b === 6) {
      const w = setWinner(s, i);
      if (w === 'a') return { a: 7, b: 6 };
      if (w === 'b') return { a: 6, b: 7 };
    }
    return s;
  });

  const earned = winnerSide ? calcPoints(resolvedSets, winnerSide) : { a: 1, b: 1 };
  const myRole = match.a === myId ? 'a' : 'b';
  const myPts = myRole === 'a' ? earned.a : earned.b;
  const oppPts = myRole === 'a' ? earned.b : earned.a;
  const isStraightSets = validSets.length === 2 && winnerSide !== null;

  const scoreStr = validSets.map((s, idx) => {
    if (idx === 2 && thirdSetType === 'tiebreak') return `[${s.a}-${s.b}]`;
    if (s.a === 6 && s.b === 6) {
      const tb = tiebreaks[idx];
      return tb ? `7-6 (${Math.max(tb.a, tb.b)})` : '7-6';
    }
    return `${s.a}-${s.b}`;
  }).join(', ');

  const regularOpts  = [0,1,2,3,4,5,6,7];
  const tbOpts       = [0,1,2,3,4,5,6,7,8,9,10,11,12];
  const longTbOpts   = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];

  const nameA = playerA.name.split(' ')[0];
  const nameB = playerB.name.split(' ')[0];

  return (
    <ModalShell onClose={onClose}>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: C.clay }}>
        Report Score
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, color: C.ink }} className="mb-4">
        {nameA} vs {nameB}
      </div>

      {/* Player name headers */}
      <div className="grid mb-1" style={{ gridTemplateColumns: '52px 1fr 28px 1fr 28px' }}>
        <div />
        <div className="text-center text-[11px] uppercase tracking-[0.12em] font-bold truncate" style={{ color: playerA.id === myId ? C.clay : C.inkMute }}>
          {nameA}{playerA.id === myId ? ' ★' : ''}
        </div>
        <div />
        <div className="text-center text-[11px] uppercase tracking-[0.12em] font-bold truncate" style={{ color: playerB.id === myId ? C.clay : C.inkMute }}>
          {nameB}{playerB.id === myId ? ' ★' : ''}
        </div>
        <div />
      </div>

      {/* Set rows */}
      <div className="space-y-2 mb-3">
        {sets.map((set, idx) => set === null ? null : (
          <div key={idx}>
            {/* Set score row */}
            <div className="grid items-center gap-1" style={{ gridTemplateColumns: '52px 1fr 28px 1fr 28px' }}>
              {/* Label */}
              <div className="text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: C.inkMute }}>
                {idx === 2 && thirdSetType === 'tiebreak' ? 'TB' : `Set ${idx + 1}`}
              </div>
              {/* Player A score */}
              <ScoreDropdown
                value={set.a}
                onChange={v => updateSet(idx, 'a', v)}
                highlight={setWinner(set, idx) === 'a'}
                options={idx === 2 && thirdSetType === 'tiebreak' ? tbOpts : regularOpts}
              />
              {/* Dash */}
              <div className="text-center font-bold" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace', fontSize: 16 }}>–</div>
              {/* Player B score */}
              <ScoreDropdown
                value={set.b}
                onChange={v => updateSet(idx, 'b', v)}
                highlight={setWinner(set, idx) === 'b'}
                options={idx === 2 && thirdSetType === 'tiebreak' ? tbOpts : regularOpts}
              />
              {/* Remove 3rd set */}
              {idx === 2
                ? <button onClick={() => setSets(prev => { const n = [...prev]; n[2] = null; return n; })} style={{ color: C.inkMute, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={14} />
                  </button>
                : <div />
              }
            </div>

            {/* 6-6 in-set tiebreak */}
            {set.a === 6 && set.b === 6 && !(idx === 2 && thirdSetType === 'tiebreak') && (
              <div className="grid items-center gap-1 mt-1 px-1 py-2 rounded" style={{ gridTemplateColumns: '52px 1fr 28px 1fr 28px', background: `${C.clay}12`, border: `1px solid ${C.clay}30` }}>
                <div className="text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: C.clay }}>TB</div>
                <ScoreDropdown
                  value={tiebreaks[idx]?.a ?? 0}
                  onChange={v => updateTiebreak(idx, 'a', v)}
                  highlight={(() => { const tb = tiebreaks[idx]; return !!(tb && tb.a >= 7 && tb.a - tb.b >= 2); })()}
                  options={longTbOpts}
                />
                <div className="text-center font-bold" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace', fontSize: 16 }}>–</div>
                <ScoreDropdown
                  value={tiebreaks[idx]?.b ?? 0}
                  onChange={v => updateTiebreak(idx, 'b', v)}
                  highlight={(() => { const tb = tiebreaks[idx]; return !!(tb && tb.b >= 7 && tb.b - tb.a >= 2); })()}
                  options={longTbOpts}
                />
                <div />
              </div>
            )}

            {/* 3rd set type toggle */}
            {idx === 2 && (
              <div className="flex gap-1 mt-2">
                {[{ id: 'full', label: 'Full set' }, { id: 'tiebreak', label: '10-pt TB' }].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setThirdSetType(opt.id)}
                    className="flex-1 py-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold rounded"
                    style={{
                      background: thirdSetType === opt.id ? C.clay : 'transparent',
                      color: thirdSetType === opt.id ? 'white' : C.inkMute,
                      border: `1px solid ${thirdSetType === opt.id ? C.clay : C.line}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add 3rd set */}
      {sets[2] === null && firstTwoSplit && (
        <button
          onClick={() => setSets(prev => { const n = [...prev]; n[2] = { a: 0, b: 0 }; return n; })}
          className="w-full py-2.5 mb-3 text-[11px] uppercase tracking-[0.15em] font-semibold rounded"
          style={{ border: `1px dashed ${C.clay}`, color: C.clay }}
        >
          + Add 3rd set
        </button>
      )}

      {/* Points preview */}
      <div className="rounded-lg p-3 mb-4" style={{ background: C.parchmentWarm, border: `1px solid ${C.line}` }}>
        <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: C.inkMute }}>Points Earned</div>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-[10px] uppercase tracking-[0.1em] mb-1 truncate" style={{ color: C.inkMute }}>{nameA}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 24, color: winnerSide === 'a' ? C.clay : C.ink }}>+{earned.a}</div>
            {winnerSide === 'a' && <div className="text-[9px] font-bold mt-0.5" style={{ color: C.win }}>Winner</div>}
          </div>
          <div style={{ color: C.line, fontSize: 16, fontWeight: 300 }}>vs</div>
          <div className="text-center flex-1">
            <div className="text-[10px] uppercase tracking-[0.1em] mb-1 truncate" style={{ color: C.inkMute }}>{nameB}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 24, color: winnerSide === 'b' ? C.clay : C.ink }}>+{earned.b}</div>
            {winnerSide === 'b' && <div className="text-[9px] font-bold mt-0.5" style={{ color: C.win }}>Winner</div>}
          </div>
        </div>
        {isStraightSets && <div className="mt-2 text-center text-[10px] font-semibold" style={{ color: C.green }}>★ Straight sets bonus</div>}
        {!winnerSide && validSets.length > 0 && <div className="mt-2 text-center text-[10px]" style={{ color: C.clay }}>Enter scores to determine winner</div>}
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-3 text-[12px] font-semibold rounded uppercase tracking-[0.1em]" style={{ border: `1px solid ${C.line}`, color: C.inkMute }}>
          Cancel
        </button>
        <button
          onClick={() => { if (!winnerId) return; onSubmit({ matchId: match.id, winnerId, scoreStr, sets: resolvedSets }); }}
          className="flex-1 py-3 text-[12px] font-bold rounded uppercase tracking-[0.1em]"
          style={{ background: winnerId ? C.clay : C.line, color: 'white', cursor: winnerId ? 'pointer' : 'not-allowed' }}
        >
          Submit
        </button>
      </div>
    </ModalShell>
  );
}

function ScoreDropdown({ value, onChange, highlight, max = 7, options }) {
  const opts = options || Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="flex-1 flex justify-center">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26,
          fontWeight: 700,
          color: highlight ? C.clay : C.ink,
          background: highlight ? `${C.optic}50` : 'white',
          border: `2px solid ${highlight ? C.clay : C.line}`,
          borderRadius: 10,
          padding: '10px 6px',
          width: '100%',
          textAlign: 'center',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          minHeight: 56,
        }}
      >
        {opts.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   MODAL SHELL
   ============================================================ */
function ModalShell({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fade-in 0.2s ease-out' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-5 pb-8"
        style={{
          background: C.parchment,
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          animation: 'slide-up 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: C.line }}
        />
        {children}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0.5; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
