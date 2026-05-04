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
    showToast(`Challenge sent to ${find(players, opponentId).name}`);
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
      alt="Baseline"
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

  // fit image to FILL the circle (like object-fit: cover)
  const baseScale = natW && natH ? Math.max(SIZE / natW, SIZE / natH) : 1;
  const dispW = natW * baseScale * scale;
  const dispH = natH * baseScale * scale;

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
    const w = dispW * r;
    const h = dispH * r;
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
              width: dispW,
              height: 'auto',
              left: SIZE / 2 - dispW / 2 + ox,
              top: SIZE / 2 - dispH / 2 + oy,
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
