--
-- PostgreSQL database dump
--

\restrict s0WeeAxi5yMzrlFKlMYlTkuGLfdf7MaM588epWk8jet7b30Re6zwavTPg7FHg0B

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: time_sheet_user
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO time_sheet_user;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: time_sheet_user
--

CREATE TYPE public.notification_type AS ENUM (
    'NO_TIMELOG',
    'LEAVE_MARKED',
    'TASK_ASSIGNED'
);


ALTER TYPE public.notification_type OWNER TO time_sheet_user;

--
-- Name: otp_purpose; Type: TYPE; Schema: public; Owner: time_sheet_user
--

CREATE TYPE public.otp_purpose AS ENUM (
    'REGISTER',
    'LOGIN',
    'PASSWORD_RESET',
    'GENERIC'
);


ALTER TYPE public.otp_purpose OWNER TO time_sheet_user;

--
-- Name: project_member_role; Type: TYPE; Schema: public; Owner: time_sheet_user
--

CREATE TYPE public.project_member_role AS ENUM (
    'LEAD',
    'MANAGER',
    'MEMBER'
);


ALTER TYPE public.project_member_role OWNER TO time_sheet_user;

--
-- Name: task_priority; Type: TYPE; Schema: public; Owner: time_sheet_user
--

CREATE TYPE public.task_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public.task_priority OWNER TO time_sheet_user;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: time_sheet_user
--

CREATE TYPE public.task_status AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public.task_status OWNER TO time_sheet_user;

--
-- Name: timesheet_status; Type: TYPE; Schema: public; Owner: time_sheet_user
--

CREATE TYPE public.timesheet_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED'
);


ALTER TYPE public.timesheet_status OWNER TO time_sheet_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: time_sheet_user
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO time_sheet_user;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: time_sheet_user
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO time_sheet_user;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: time_sheet_user
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    company_name text,
    phone text,
    address text,
    status boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.clients OWNER TO time_sheet_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    text text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    metadata text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO time_sheet_user;

--
-- Name: otps; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.otps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    otp_code text NOT NULL,
    purpose public.otp_purpose DEFAULT 'GENERIC'::public.otp_purpose NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    used_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.otps OWNER TO time_sheet_user;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO time_sheet_user;

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.project_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.project_member_role DEFAULT 'MEMBER'::public.project_member_role NOT NULL,
    hourly_rate numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_members OWNER TO time_sheet_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    project_code text NOT NULL,
    description text,
    client_id uuid,
    project_manager_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.projects OWNER TO time_sheet_user;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO time_sheet_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO time_sheet_user;

--
-- Name: task_assignment_events; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.task_assignment_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    from_user_id uuid,
    to_user_id uuid,
    changed_by_user_id uuid NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.task_assignment_events OWNER TO time_sheet_user;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    project_id uuid NOT NULL,
    assigned_to uuid,
    assigned_by uuid NOT NULL,
    status public.task_status DEFAULT 'TODO'::public.task_status NOT NULL,
    priority public.task_priority DEFAULT 'MEDIUM'::public.task_priority NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tasks OWNER TO time_sheet_user;

--
-- Name: time_logs; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.time_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    task_id uuid NOT NULL,
    project_id uuid NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    time_spent_minutes integer NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.time_logs OWNER TO time_sheet_user;

--
-- Name: timesheet_exports; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.timesheet_exports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    created_by uuid NOT NULL,
    file_name text NOT NULL,
    filters_json jsonb NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.timesheet_exports OWNER TO time_sheet_user;

--
-- Name: timesheet_statuses; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.timesheet_statuses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    status public.timesheet_status DEFAULT 'DRAFT'::public.timesheet_status NOT NULL,
    is_leave boolean DEFAULT false NOT NULL,
    leave_source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.timesheet_statuses OWNER TO time_sheet_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: time_sheet_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    dob date,
    gender text,
    profile_pic text DEFAULT 'http://localhost:5000/uploads/default-user.avif'::text,
    password text,
    role_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    tfa_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO time_sheet_user;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: time_sheet_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: time_sheet_user
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	854965630ca1ba2805557765217fa463483341ea7f9ac8bcad96f20a8d360a5a	1777352205954
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.clients (id, name, email, company_name, phone, address, status, created_by, created_at, updated_at, deleted_at) FROM stdin;
f6bf527a-d71b-4cf1-b2c2-bef799277dc9	Test	test@google.com	Google	\N	\N	t	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-28 05:12:02.223436+00	2026-04-28 05:12:02.223436+00	\N
c488756f-3add-41e4-8af6-cc873d6274cf	Sandy Trachy	sandy@yopmail.com	Intellix	9646277133	London - England-UK	t	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:44:45.492811+00	2026-04-28 07:15:47.6+00	\N
d70c214e-8570-43aa-a64b-26ad9cd2e9f3	Uday	uday@yopmail.com	Blunox	9646277133	USA-North Island	t	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:43:39.853137+00	2026-04-28 07:15:56.312+00	\N
b9596996-5c82-48a9-bbbb-f6156766a35e	Prabhjot personal client	prince.ids839@gmail.com	IDSIL	+919334326203	chandigarh\nsector - 13	t	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-29 09:50:29.179441+00	2026-04-29 12:31:21.211+00	2026-04-29 12:31:21.211+00
730d75c5-2a74-40b1-b25e-1b6549c1dcbf	Dr.Robert	robert1@yopamail.com	Advilex	\N	I.T-Park Chandigarh	f	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:41:41.660611+00	2026-04-30 04:33:42.542+00	\N
bd33648f-1b84-498c-8a9d-a0dfc95301d2	Dr.Par	par@yopmail.com	Calarity	9646277133	I.T. Park- Canada	f	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:42:45.671544+00	2026-04-30 04:33:56.95+00	\N
c536be38-618f-4af2-ab89-18276458ab2f	Sergey	sergey@yopmail.com	Chemwatch	\N	\N	t	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-05 06:40:24.639741+00	2026-05-05 06:40:24.639741+00	\N
b98ccf00-5331-4372-9683-8dd0f787310a	David Soderstrom	ds@diagona.se	Diagona	\N	\N	t	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-06 04:21:10.173525+00	2026-05-06 04:21:10.173525+00	\N
80c3fe5b-262f-4dba-88a0-b30f4c6b95a1	IDS - PM Tasks	sumit.g@idsil.com	IDS Infotech.	\N	\N	t	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-07 07:19:39.86391+00	2026-05-07 07:20:37.62+00	\N
b13b14ed-62f6-4036-8aef-db38283798fe	Harman	harman@idsil.com	TECLA	\N	CTP	t	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 05:57:31.163518+00	2026-05-08 05:57:31.163518+00	\N
3825530e-2646-4620-9de9-49dfb1df4f05	Sumit Gupta	sumit.gupta@idsil.com	IDS Infotech	\N	CTP, Chandigarh	t	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:03:05.101391+00	2026-05-08 06:03:05.101391+00	\N
709e9c69-1184-40dc-a35d-e0b596b92219	Prabhjot Singh	prabhjot.singh@idsil.com	IDS Infotech	\N	CTP, Chandigarh	t	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:20:38.974041+00	2026-05-08 06:20:38.974041+00	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.notifications (id, user_id, type, title, text, is_read, metadata, created_at) FROM stdin;
4d8fbdb7-cb2e-407b-b3f2-6e121d02b815	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:04:00.19928+00
e753ea22-c784-4e34-a31c-5bf3dd4ae315	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:04:00.19928+00
ab3aa8c1-c31e-418d-a2d8-0cf73baf2c0b	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:04:00.19928+00
5cb4e751-216d-47b2-862a-3c3fd3beabbe	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:04:00.19928+00
af3b9dfe-539a-4a5b-9a5b-7099c794202b	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:05:00.258492+00
ded2d914-3e63-4d16-912e-6719eb01346d	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:05:00.258492+00
57e6b871-0805-4f68-8150-2a6c91f74afa	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:06:00.280746+00
d8e16085-1496-4add-8097-ee970f455d9f	acd78675-ae69-4308-97d5-1b23f8f2a15b	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:06:00.280746+00
43f2e1e4-d847-45d7-91fe-008221437b2f	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:07:00.32345+00
a3ee2ba7-cca0-41a2-be36-0a58eca5cfe3	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:08:00.362267+00
2509a6d7-1ed0-4a1e-ab6b-0de25982c848	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:08:00.362267+00
3c0037bc-751d-4404-b99e-13a39bf406cf	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:09:00.433519+00
93a738ee-8ae2-472d-b26f-ca43bf6256a1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:09:00.433519+00
028255fd-b75f-4ff7-993b-506ea777b20b	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 05:09:00.433519+00
0e7b3483-5202-4b1f-8629-edd8f555ff82	4f980d85-4b3f-45d3-8163-4dad2e229146	TASK_ASSIGNED	New Task Assigned	You have been assigned a new task: "Process Documents".	f	{"taskId":"f8d7a603-d051-48f1-a612-a6eda5e94011","projectId":"e52617ba-6e0c-44b9-b91a-a90c4188571b"}	2026-04-28 05:48:36.13458+00
352956a5-8896-4968-ba34-bbe660a9366c	4f980d85-4b3f-45d3-8163-4dad2e229146	TASK_ASSIGNED	New Task Assigned	You have been assigned a new task: "Record the Sessions".	f	{"taskId":"3fc9637c-cc52-4f35-98fb-4e7f7eac3514","projectId":"f08aff21-8840-4cf6-ae77-d6fdfff5d5b4"}	2026-04-28 05:49:24.764726+00
6d226fa6-569d-4ab8-80b7-7e090cf20db3	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 06:12:00.628309+00
c366dd81-72f6-4ce2-9a68-757de4173041	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 06:15:00.794247+00
7d03f524-fc3d-4fb5-98da-1468857264d6	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 06:17:00.900282+00
0304254b-2051-4fc1-b262-31849a0b9e00	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	f	{"date":"2026-04-28"}	2026-04-28 06:19:01.011239+00
e5361698-c4b2-49a1-a8a1-4792a4243e2d	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	t	{"date":"2026-04-28"}	2026-04-28 06:24:00.247819+00
ab160f8c-f541-43ef-92d3-f7c83ccbf41c	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
3bb02da4-06ee-47d6-9f32-f914e3878c92	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-04-29).	f	{"date":"2026-04-29","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-04-29 00:00:01.052201+00
a3dd3daf-93fa-40eb-ab65-10458221f254	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
57fddef3-dd96-46d6-a148-5a934ec75151	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
c1544336-b478-45c9-b541-a4efca02f90a	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
1ee96ed1-2487-4d99-8c24-f8ab79804277	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
841492ec-fa41-4e62-b436-3cc092230c1e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-04-29).	f	{"date":"2026-04-29","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-04-29 00:00:01.052201+00
1e11fd08-7a30-47e1-93a7-91db176abfff	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
c9b7f673-d0e2-417e-9c6a-14495175a081	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
6c22c6d6-c24d-481f-af97-ef388194652c	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-04-29).	f	{"date":"2026-04-29","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-04-29 00:00:01.052201+00
4634e1c1-8820-4eaa-b2d3-146afda2c85f	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
57921aac-ca62-4142-ac3f-377acfacd1a4	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	t	{"date":"2026-04-28"}	2026-04-28 05:09:00.433519+00
eb5ce63e-b40b-4971-abf3-a3b1b4ded03f	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	t	{"date":"2026-04-28"}	2026-04-28 06:14:00.723577+00
83bdeb5a-3790-4308-a733-ad01697528b9	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	t	{"date":"2026-04-28"}	2026-04-28 05:08:00.362267+00
b909bc79-17bf-4ee9-94b9-530ae3fb4428	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	t	{"date":"2026-04-28"}	2026-04-28 05:05:00.258492+00
e19bef61-1f48-4842-81e0-c1a57c210077	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	t	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
1a345554-0954-44cb-be9d-1a1888134738	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-28). Please update your timesheet.	t	{"date":"2026-04-28"}	2026-04-28 05:05:00.258492+00
41e926f3-4d75-415c-9957-8acff071fae2	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
a64dc245-0be4-48f8-80f6-5f3eeaa414a8	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
a1c20bda-4d57-445a-9a84-b23cf933b697	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
78e7129c-8cb4-48f3-b382-dff653494046	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-04-29).	f	{"date":"2026-04-29","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-04-29 00:00:01.052201+00
fd603778-c3e5-491a-8968-a2c16a7bbb76	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
c43a5b2a-348c-410b-b5f6-f8bd450ceb04	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
2bd88eb9-215b-4acd-9d8e-92b683837ddc	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
343401d0-ecf9-4592-9625-5880d1d9c34a	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
fdbd9dba-31a9-43b8-90d5-75811cf63b90	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
707df30c-1b2d-49cf-9078-0baf05354f26	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
e71b399e-e9ad-4319-b1be-69da3d24e724	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-04-29).	f	{"date":"2026-04-29","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-04-29 00:00:01.052201+00
6aa6a2d1-58a3-49f1-9db8-0afb9576d007	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	f	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
50be63c9-4a72-4067-807d-80bc872ea730	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
205277ee-46d1-467c-bc16-155f8840d0df	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-04-30).	f	{"date":"2026-04-30","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-04-30 00:00:00.087729+00
9fe96509-45d7-4d5d-a44d-4e4820e12a78	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
5c78daf9-0925-4b31-8969-fd9a67933dd4	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
c463556b-3109-4870-add6-eaa36896190e	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
2b21e90d-fea7-4419-a715-6a0c3cab85c1	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
4487ead7-174d-4f1e-9b57-e1ea907b56d7	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-04-30).	f	{"date":"2026-04-30","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-04-30 00:00:00.087729+00
04320ad1-7058-4e67-a5c2-92f67046dd50	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
f9b19522-9e41-4296-a168-f3958cab4532	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
4f3e9908-0154-4d3c-9fc0-154842e656aa	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-04-30).	f	{"date":"2026-04-30","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-04-30 00:00:00.087729+00
b238941b-67a0-4a4e-95cd-2beb14cf5c47	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
4b2912aa-e1bc-41a8-a514-79d45ec01a09	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
dda568fa-84f9-4896-9c87-5ca55223f9a3	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
30ed6afe-689e-4140-abbb-e7f35d067090	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
893c8eac-6af0-415a-a5de-69987b5fbc1b	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-04-30).	f	{"date":"2026-04-30","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-04-30 00:00:00.087729+00
3d9f9311-e7ba-4a38-8594-80d491c927c9	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
3d74978d-1d2b-48c6-96fe-6e3e0acdc7f4	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
844dc51b-ba41-4e6e-846e-9cd2c61380cb	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
880e9869-05d9-4f90-a8fe-a58c671a0a21	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
89558609-b289-4439-b776-9e49e2cbd7e4	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
e809e91a-04a9-4f3e-832c-e11694d16953	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	t	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
e12c6c57-eaf2-4f21-850c-e19ad69646d7	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	t	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
b5daaa7b-aa3c-4d3f-ae8a-22825fe3f2da	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	t	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
9fb62001-bafe-4c78-9b87-9417bc935b6a	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	t	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
be7864da-c29d-459d-94b3-f136c6aa8277	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	t	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
b7a8c4a5-b309-4312-a229-91f87b4f30f4	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	t	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
e2be6278-abae-4223-bcf1-0f644ef04a80	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
e34e6eab-07a2-4cff-af02-77a884dce628	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-04-30).	f	{"date":"2026-04-30","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-04-30 00:00:00.087729+00
6f866fee-3d31-4971-b524-d9b0c491b9ed	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	f	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
a636b35b-653a-4bcc-a497-dadac890cf22	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
d7fa62c4-1928-4bba-aeab-947944047982	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-01 00:00:00.870302+00
519e1b27-e0d3-4bea-982c-5005166d9de2	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
80053e4e-d5db-4573-b9e0-cbf75343dd9e	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
f268c9fc-6398-47a5-9ba3-961b60184010	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
568f8615-be3b-4e8a-b9e5-fb6a9d07705f	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-01 00:00:00.870302+00
d982f522-2f9e-4ec2-bf48-3207c3fb50fa	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
88ffb36c-c401-41ce-942a-d37c08c03c48	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
ea5136ef-683f-4148-aa1a-b366dab0de77	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-01 00:00:00.870302+00
2663afde-9ddc-4052-812a-109d97caf625	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-01 00:00:00.870302+00
6a061654-779a-4328-9550-02917d615128	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
188d2c4a-ce79-4397-9ea4-2594f3575845	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
05a7dfdc-ab9b-449a-93a7-68f7384bfec0	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
429996c5-b686-4853-8683-20d3e7a8e268	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
0cc4fedd-f445-42a9-a4b6-116deabf885e	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
100779d9-aa9e-40bd-8500-e56b6df7a6ea	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-01 00:00:00.870302+00
5c26c238-97ed-4364-aa54-b3e332877fd5	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
77f79a1b-5556-4e3a-b6d9-104ac85818fe	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
9c815882-feb5-402a-b130-40477d12117d	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
27b40496-d712-4a4f-aba7-34ef66e114ba	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
26e76fa8-9cf4-456a-9e4d-323aa7aa29c5	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-01 00:00:00.870302+00
baec5c5f-be0a-463c-84d1-683a9dc15b45	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
e8f51649-b1de-417a-8b53-20a10f15c173	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
19a4340e-0bef-42f6-89ff-6e0514f1aa0f	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-01).	f	{"date":"2026-05-01","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-01 00:00:00.870302+00
d19c7280-1069-411f-95d9-671ae3bd037a	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	f	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
16bc8fa5-6f40-4d0b-b914-2641fa6aeb4f	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	TASK_ASSIGNED	New Task Assigned	You have been assigned a new task: "Upgrade feature development on the Window and Mac".	f	{"taskId":"08f20dd1-de0a-4f1c-8567-5af391092c5f","projectId":"da2d585f-0d82-4023-b47c-e2e410bfea8a"}	2026-05-01 06:28:11.671847+00
e0f8a79a-6d70-4604-9d0f-a552f634fd44	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	TASK_ASSIGNED	New Task Assigned	You have been assigned a new task: "Fix Mac upgrade feature".	f	{"taskId":"4afe1926-8e08-4dae-a823-fc0dbb6a6a31","projectId":"da2d585f-0d82-4023-b47c-e2e410bfea8a"}	2026-05-01 06:29:30.417744+00
8633fc1e-ea51-4a1c-9af0-a9f06a38e71c	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	t	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
c1e9de7f-616d-48c2-a019-cbeeb99de4fc	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-30). Please update your timesheet.	t	{"date":"2026-04-30"}	2026-04-30 00:00:00.087729+00
9bb1817a-e23a-476d-b1af-d7c7f627dd97	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	t	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
a95b4766-f6aa-43ae-b30f-350bea6c4142	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
bfa1188e-ced1-468f-a471-8e210991b322	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-05 06:35:00.890592+00
7e921582-73a7-41b3-84f6-0044dd1a28e5	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	t	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
ab588b1f-4572-4b58-93f5-4c5004c5e125	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	t	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
0c788116-43d6-4cc1-89e5-0c32353ee9b2	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	t	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
b3f2a12a-81d8-4aa6-9103-afbf9031b430	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
14d09a17-355a-4e3b-b32f-e2dddd11ea27	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-05 06:35:00.890592+00
ed5ab1a4-c446-4c46-8608-c723c4cdb786	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
849ee49c-e784-430d-bb05-7c98cf6c04a8	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-05 06:35:00.890592+00
856dc86e-e588-405a-a009-33e86f2e0210	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
2590c050-7577-46c5-9348-4ba59c9b0a1d	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-05 06:35:00.890592+00
0f53ba78-570d-4473-9b15-619f098aff98	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-05 06:35:00.890592+00
95b2e443-e8db-400b-9034-f5b120521927	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
b72040cb-7046-496a-b606-384dfb982125	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
05cbf5d0-aa9f-43c2-ba03-dd40f98c869e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-05 06:35:00.890592+00
7fe5e88b-f58e-41ec-aa91-8c5eacfb8197	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-05 06:35:00.890592+00
93981207-f33c-456d-b0f6-7b6bf4a300d2	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-05 06:35:00.890592+00
ff2c2c91-77f9-4ae8-8f32-757f5e72d6e1	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-05 06:35:00.890592+00
cc40f7f1-9367-4e94-99f0-b9ad40a04408	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
e83dc6cf-8af0-4d1a-a984-f5f89c1c0d54	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
200c1ae2-33ca-4f16-8fa2-97125c4d4ef7	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
c181538a-0f69-4608-8d08-9a92e39d2148	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
b250e3c7-928a-4ae7-b688-60ab7fdfff4f	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-05 06:35:00.890592+00
486f8735-8d47-4837-b0d1-a1452df65b7a	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
bec617da-543b-47fb-ab6b-b1ae3263d6d4	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-05 06:35:00.890592+00
9cc5030e-1e10-48c1-b241-c7230cd3e510	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
78ff2a43-41e7-4eee-89f3-b3bd14b790bf	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	t	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
2cd615ad-7be0-460b-a689-00dff50e89a2	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-05 06:35:00.890592+00
0e2de251-14d1-4520-ba83-9ed01864d4c9	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-05 06:35:00.890592+00
764cfe28-e34f-411b-9e7a-5cb2c91bf9b1	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-05 06:35:00.890592+00
061407a5-c160-455d-82c3-99c5a189b4f8	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-05 06:35:00.890592+00
9fc82cf7-2a17-4101-bf8a-9294cecffb0a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-05 06:35:00.890592+00
b76b3b5d-a787-496b-a5af-a2ff432348c1	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-05 06:35:00.890592+00
57cd4f9f-97dd-47d3-907c-635e47b0edea	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	t	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
17e88c4d-06cf-4e9c-bfbf-b153da0d677e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
c2185e44-06ad-4e0d-843d-c0b60e3b3dcb	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
2f49c815-f756-4012-8ad3-fcd2d9d4e514	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
84681098-1b44-45fe-ba12-504503b5c31a	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-05 06:35:00.890592+00
95663d6a-1770-4005-997a-8aaa71ebb68c	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-05 06:35:00.890592+00
798c5392-6845-462e-9440-346d192821fa	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
3e1f9c42-27b9-416c-a8df-f718a05559e9	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
ca179b28-64e5-4a0b-a019-388fb6949672	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-05).	f	{"date":"2026-05-05","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-05 06:35:00.890592+00
0678e295-6e65-46cb-9ccf-1b51ed9bf631	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	f	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
81fb9e16-d927-4536-84c3-683aa55593c5	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-01). Please update your timesheet.	t	{"date":"2026-05-01"}	2026-05-01 00:00:00.870302+00
c3747d0a-6a47-4485-8d5a-d20acda0264c	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	t	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
7559e25d-83ae-430c-84d2-1e78a5c70750	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	t	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
9e0f728b-3e52-4391-adf1-5720ca009c10	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
6bb98b00-16ca-4795-a0ed-7be7e3a9a7c9	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-06 00:00:00.497977+00
4d092664-153b-4c2b-9cb3-516a6e61164f	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
651012e4-5117-45dc-8d68-cfda3f31e632	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-06 00:00:00.497977+00
993d677a-0d01-41ce-8745-169a14ccb77f	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
6a35ad3d-e82b-4878-8f2f-d825f74d7bae	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-06 00:00:00.497977+00
7dc1744b-5aa4-4fb5-a318-3fe8c83b5468	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
b44a1dc3-ad5c-4201-9a0b-1fc9e78078b3	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-06 00:00:00.497977+00
988d7ae2-e8db-40d0-85ba-bc3825b4378d	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-06 00:00:00.497977+00
51a48046-4530-470d-8559-2036bb7df731	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
72c4bd8c-d32a-4a79-9573-c63cd1d8d72e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-06 00:00:00.497977+00
bbd66176-d2e0-415d-b6e2-7ad27f60dd48	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-06 00:00:00.497977+00
b9394f96-f676-4f22-95a3-bf84d1f88db5	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
a8eaddd7-961b-4005-86b4-13bf9af9c773	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-06 00:00:00.497977+00
2d11fc8a-652d-437f-9cc3-90523278bed1	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-05 06:35:00.890592+00
7670384b-6667-4434-a414-6d18f95542ea	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-05 06:35:00.890592+00
97d2bdce-b8e4-447d-9108-ecd1acf7cf6e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-05 06:35:00.890592+00
a6f1f796-2a60-4b78-8dbf-97dc05604b13	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-06 00:00:00.497977+00
3e691b67-78df-406f-8d83-15723ca4e774	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-06 00:00:00.497977+00
8b9e01b3-3cf0-4882-b5d9-98acfeea3345	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-06 00:00:00.497977+00
93ff19db-3334-477d-af68-dd355ac2346d	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
65ef8b99-1001-4517-8b81-da9f325d9acb	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-06 00:00:00.497977+00
16ddd8bd-104f-461c-9049-5fc1a6c34f94	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-06 00:00:00.497977+00
d031269a-0274-472d-83cd-9c69d4888791	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-06 00:00:00.497977+00
5212a26c-1e42-4137-8d8e-cadc207912b2	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-06 00:00:00.497977+00
ba43c809-be01-4d4e-a703-88aed61ea9cf	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-06 00:00:00.497977+00
c4ea3484-3ae9-420f-bae1-6341b2bd1e31	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
7bcb93f6-cbb3-4e23-85df-a4025a50e2d5	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
5426a177-0396-4c9e-8878-f2b9115b5fb0	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
39bbfc5a-3878-4eae-a47b-66434eb107d1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-06 00:00:00.497977+00
125c4083-b4e9-4fbd-abac-6d487a6e6f04	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
47afd409-5752-47c3-a724-e5d0d706d107	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-06 00:00:00.497977+00
1e9637e4-588e-463f-ab30-8bee511b463d	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
4593feb0-39e0-47f6-a854-268fbccfb7da	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-06 00:00:00.497977+00
23728120-320e-4806-b816-80568e7e49db	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
9482c67c-bc48-4237-91e7-372ffa55d821	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-06 00:00:00.497977+00
3d60b33b-c4d5-4a22-b759-c8c4efd9b716	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
38b50ab1-bd52-4232-912c-ed6e9cf87b5f	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-06 00:00:00.497977+00
7896f652-fc53-4998-847f-393581a969a2	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
0885ae39-598d-4f30-b6a9-79e3aa1005c4	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-06 00:00:00.497977+00
0194b02a-652a-49a8-a792-f74260609129	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-06 00:00:00.497977+00
d199773b-b1ee-4e7b-8acd-fa656e016492	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
2036fd94-d9ad-4b21-b708-ff59b1c7f338	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
4a284a01-0fe2-4e64-a48d-b551cd615002	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-06 00:00:00.497977+00
84639871-2fb5-49e7-bb4d-c0d826b0215e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-06 00:00:00.497977+00
40e1c637-2f29-473c-8092-3812231c676f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-06 00:00:00.497977+00
ac6d55ef-8461-4d80-a934-243cf2b9e874	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	t	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
c4d57067-d6be-4691-8f90-7a1515471461	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-06 00:00:00.497977+00
168e1d02-ecb3-4fea-9b7a-364fba3dbf8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-06 00:00:00.497977+00
4deca6a5-4fcb-436c-ac2c-4a01d5db7d32	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	t	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
2d4b4b1f-d31e-4a0b-9a01-ea660b26b7f3	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	t	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
c837544b-3b96-4e5a-a1fc-05cdc69f4760	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-06).	f	{"date":"2026-05-06","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-06 00:00:00.497977+00
dcbd45ca-5848-4a9f-8a51-2cda069d82f2	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	f	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
54c14498-f71b-4714-a944-32cf919ae72c	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	t	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
a3277df2-fc41-4887-b73f-d77af80e93d8	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-04-29). Please update your timesheet.	t	{"date":"2026-04-29"}	2026-04-29 00:00:01.052201+00
9c639d4c-0da0-4915-a468-ce9c8706d757	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-05 06:35:00.890592+00
a6ffc7b5-5378-47a7-a827-e428fae9be4e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-05 06:35:00.890592+00
65865223-1d96-4298-9cc1-ccb14b7a4ef6	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-05 06:35:00.890592+00
2a6891a8-da8e-46b9-85fe-78ec1c16090e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-05). Please update your timesheet.	t	{"date":"2026-05-05"}	2026-05-05 06:35:00.890592+00
c4aa13fa-73f9-4c86-8001-e38e1df6e118	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-05 06:35:00.890592+00
cbabee53-9009-41f9-86bc-88216c58115c	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-05 06:35:00.890592+00
11213cf2-ee9e-4455-a1aa-e759eed7ceb7	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-06 00:00:00.497977+00
ae915bee-f4d3-4ccd-b0be-9db2982da488	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-06 00:00:00.497977+00
313338b1-36de-4817-a41b-0ec294f0493c	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-06 00:00:00.497977+00
f39bd2f6-404b-4849-bf02-db88e2b3e106	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-06). Please update your timesheet.	t	{"date":"2026-05-06"}	2026-05-06 00:00:00.497977+00
113089c6-9605-498c-b19e-810c32295904	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-06 00:00:00.497977+00
3ba539c1-5c30-43b4-b4d8-7db98d32c14a	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-06 00:00:00.497977+00
6c99cbfb-3c01-4063-9662-b34ce3beac90	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-06 00:00:00.497977+00
d9fb6d52-9be0-4397-aea0-ec07cf996d2f	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
f3b25019-0ba2-4245-8b5b-6d2f8ea98060	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-07 00:00:01.023338+00
1a2f30fe-0392-4749-a052-723c80a155d5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
fa32d0ad-1fad-4e54-8060-1f7cf54ab628	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-07 00:00:01.023338+00
6984379d-b7f1-4e7e-95b7-5f0911d3f315	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
63ce3cc0-de8c-4a17-b2ef-cc58275e7f13	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-07 00:00:01.023338+00
799d2364-febb-4e4d-8150-c2e039953836	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
a495443a-e186-4706-ba40-c32ba7357ba7	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-07 00:00:01.023338+00
3d56d03b-27c2-41d6-b521-f3f920e72679	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-07 00:00:01.023338+00
44388973-5fa5-4333-94a1-31356c947f6c	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-07 00:00:01.023338+00
43a07cbd-0215-4e31-80c6-0112624b7a08	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
4f3fd501-7858-4ac4-b3a0-93e8849bfebe	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-07 00:00:01.023338+00
8569808c-7abd-434d-9ad1-e4272f55b47d	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-07 00:00:01.023338+00
7e7b5aca-9dad-40cb-8185-01a30b8be4f6	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-07 00:00:01.023338+00
4b47e8e4-c5c6-41ba-aded-7fd882d84a67	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-07 00:00:01.023338+00
75635098-3293-46ba-9a08-67da345cdca9	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-07 00:00:01.023338+00
6ce60eee-ee00-4d8b-a503-5d2363b5657d	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
df4b23ac-4171-4f80-a093-4dc4098415e0	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-07 00:00:01.023338+00
0cff422a-46f3-491f-a96e-5f5ef5de536e	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
9f7835d3-f630-45e8-ad2c-b1b22bbf4eac	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-07 00:00:01.023338+00
dafb1333-85b9-4e6f-b82a-7f343542a4fa	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-07 00:00:01.023338+00
e06ddf08-c62e-465b-8e92-729803126810	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
5438a63f-2c61-4096-8b46-1d8e6f08f2db	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-07 00:00:01.023338+00
ec607596-2fc2-44dd-84ad-db288d6c8b93	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-07 00:00:01.023338+00
0f78ae86-c541-4fff-a4ec-886f577ecf8e	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-07 00:00:01.023338+00
06057e76-0c23-4831-be93-4915d2701c4a	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
3acf2938-fddc-4163-adec-bec48e80bd1e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
7851af3a-3089-40fa-a8d2-a00f73116b33	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
27d8b41a-8e4e-482c-ba29-fe3ce2b37309	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-07 00:00:01.023338+00
696162f2-759f-4de7-bc56-62c02b4dd955	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
07f843eb-35e3-4e12-9a19-25b2035151e2	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-07 00:00:01.023338+00
89557054-6ff1-48c3-ac97-b088c30d7e56	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
2a21074c-de4d-4109-b73d-b357dfb57031	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-07 00:00:01.023338+00
580d4619-feb9-4f2a-ba58-1914ed07daee	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
b7d2423a-1e6f-4a15-8f76-a813802a5cee	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-07 00:00:01.023338+00
4a5a6f6b-980e-4ea2-9166-50463c135e39	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
c377d715-3f39-4dc8-b7be-826ea8e32e5e	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-07 00:00:01.023338+00
76d4c424-c0b7-4cf7-ab17-8e903032279c	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
fe718fb2-4e37-427e-8857-3e64122b7621	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-07 00:00:01.023338+00
26f91dfd-60a7-4411-bf10-1226eda3bfe3	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-07 00:00:01.023338+00
3843a92f-18cc-4330-9110-71e10b907f73	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-07 00:00:01.023338+00
635fdf50-f087-43d3-9d0a-580bf2a7fb8f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-07 00:00:01.023338+00
a3f1c925-d2a5-41c1-8c96-98c819f18ce1	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	t	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
281cf2dd-b543-424e-acfd-25a10a9cc3a4	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-07 00:00:01.023338+00
94cbbe42-9146-44b1-bb64-1e9a768f1247	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-07 00:00:01.023338+00
e2b1f68f-b7db-49b4-be7b-bc66ba464e00	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	t	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
bccfa795-8ea5-4194-82aa-60727d349a39	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	t	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
406de40e-7949-4c6e-ba11-098fb98eba26	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
5ff88b6d-d71b-4de8-848a-8b3f4864ce84	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-07 00:00:01.023338+00
6ee22aec-3d93-4aa1-8af6-fcda2d480c93	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
5cb02faf-9479-4af5-b2ff-a2c4c68d3c0b	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-07).	f	{"date":"2026-05-07","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-07 00:00:01.023338+00
b4160067-c8b3-4942-8982-21fb03027158	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	f	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
3c25a171-aae4-4428-a1e4-2813a37c448c	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-07 00:00:01.023338+00
c6a2f0c5-f54a-4608-bfdf-31b0a0a4b4a5	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-07 00:00:01.023338+00
07ed7889-c38e-4edc-b45d-55760b74c32a	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-07 00:00:01.023338+00
0306473c-f804-4163-84b2-94fd07341730	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-07 00:00:01.023338+00
f7883a1c-3f6e-4f24-ba5f-b90c7600e9fe	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-07). Please update your timesheet.	t	{"date":"2026-05-07"}	2026-05-07 00:00:01.023338+00
fc64a713-233f-4100-a178-ab4060f1e715	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-07 00:00:01.023338+00
85d114bf-b1ed-41c6-a858-62b6a633eb73	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-07 00:00:01.023338+00
5c6750c9-c71b-46c5-946b-ace1c7d5a0d3	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-07 00:00:01.023338+00
3ff9b462-aced-4904-9865-1fb0d1d3413e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-05).	t	{"date":"2026-05-05","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-05 06:35:00.890592+00
c13a2b8f-33cf-4534-a328-a2ad9c72cfff	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-06 00:00:00.497977+00
eb978483-54ea-4b01-81f3-7b0ecdcd2081	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-06).	t	{"date":"2026-05-06","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-06 00:00:00.497977+00
19e252b3-557c-4ff4-bd81-69779e0ba26b	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-07 00:00:01.023338+00
e7c9e6f3-5524-4ce5-9796-6a4b87eecb77	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-07).	t	{"date":"2026-05-07","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-07 00:00:01.023338+00
212b66c3-19d0-44b0-b030-e549bdb884b3	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	LEAVE_MARKED	Team Member Leave	Anubhav Rana has marked leave for 2026-05-06.	f	{"memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e","date":"2026-05-06"}	2026-05-07 06:30:14.156636+00
20283efc-91ec-4608-ba4f-72ce60540e3b	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
e4fc9a04-6fff-4e0c-8b0a-cddc6a47e7ee	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-08 00:00:00.855852+00
0de244b2-1c07-4ab3-9469-cf7ae4ab2c7c	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
e61767db-7833-4075-b6be-6fbd357f3c7b	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-08 00:00:00.855852+00
b5db820a-0c1a-4f0e-9ef4-0b2ebda7a337	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
cbbdfda8-7e79-4ebf-b8e7-4bb1ef8fce3b	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-08 00:00:00.855852+00
84354924-41a5-478d-8873-92e1f71812d2	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-08 00:00:00.855852+00
1de04119-6584-4b48-a6f3-eb63d2f1aab0	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
3ef84a27-66a6-44a0-857d-3bf76ddb83c9	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-08 00:00:00.855852+00
70c366b5-dfb4-48fd-9918-1bdb20294d97	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-08 00:00:00.855852+00
d8783f50-cc53-42a3-a6df-85cc7f87c945	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-08 00:00:00.855852+00
f05c8009-16a8-499b-ad6f-c6d2049f3b57	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-08 00:00:00.855852+00
c238dc46-12cc-4a80-82fa-230c4b4af78d	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
30593b1b-0478-4051-924b-4b9e1566d22b	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-08 00:00:00.855852+00
210e4726-4489-4004-946d-4a0a9d2ffe61	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-08 00:00:00.855852+00
0067ff7b-5a32-4c87-9400-1a5312e74886	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-08 00:00:00.855852+00
5bc69fb8-0eca-4db6-b1e1-9fea9cc77a20	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-08 00:00:00.855852+00
ee160812-6b13-4805-96f9-1c540083eaab	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-08 00:00:00.855852+00
cefa89ab-9bcf-403c-a313-21256cbac533	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
759949e6-080e-4bff-8909-cf1baf465ede	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-08 00:00:00.855852+00
e3c96ba5-0131-4398-9cd3-eb7eaab2080f	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
9a2d238d-e8ae-435b-8bb2-bed6017082c3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-08 00:00:00.855852+00
187ba3f1-f76d-4969-8614-7dd69e5ffcdd	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-08 00:00:00.855852+00
b334ff75-92b2-42b2-acfb-e39875800917	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-08 00:00:00.855852+00
b6c8d7de-3cb2-4416-9b25-a109ce493ba7	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
32bd358c-b8e6-400d-81e9-60b2b2569e47	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-08 00:00:00.855852+00
03b5654c-a2ee-4207-845e-35ad90810622	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-08 00:00:00.855852+00
e7940f09-7d4c-4d07-a6f6-ebf260fc1779	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-08 00:00:00.855852+00
98b23865-c230-4f8f-b179-727e6db144b7	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-08 00:00:00.855852+00
72e93385-e6a1-4983-a2de-3109fbf149fe	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
ccdb5d2c-c6cf-45f3-a350-c85af6b49248	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
77a84a68-1750-4da8-9d3b-ddb9d77c18d6	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
7017feb8-a819-473f-b9d1-5ef0703e641d	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-08 00:00:00.855852+00
f0b87cbe-4f75-49f3-92d7-578045de0a27	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
a777584b-1562-4760-8c06-ddadbe965870	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-08 00:00:00.855852+00
85df03f1-4fc8-4afb-9f6e-4b68b8e75be5	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
50be1cde-83fc-43ee-bdd3-2202ab533db5	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
35563b6a-752a-498b-b0ba-c3f97a4b255b	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-08 00:00:00.855852+00
4ac420bf-2498-4e90-8bbb-50b23e22ab79	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
3fedc352-3822-4011-9838-baa4cb015d94	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-08 00:00:00.855852+00
698f9ddd-2710-45ae-ab48-dfbf6d4927f9	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
db3125ce-380e-4f04-b2e1-94fc6afc9801	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-08 00:00:00.855852+00
26bb145a-7f62-493a-835b-5d43b1d58e25	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
3bbdfc21-c834-4f1f-abf3-88278e65baff	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-08 00:00:00.855852+00
ee755b2b-f37c-46c7-8101-e6631f45d93c	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
00fca2ea-b1d8-4bef-a0f5-318cc744da78	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-08 00:00:00.855852+00
75152706-9cad-4847-9532-f9b94e70b9e0	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	t	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
39d2d3e4-4cc0-46da-b51b-a04c7c09b1c6	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-08 00:00:00.855852+00
5a1b0c8a-e9c2-458a-83ea-f2da8953a5d0	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-08 00:00:00.855852+00
6f14b37c-70bd-4d52-846e-892dbd3a6aff	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
89886d3f-6836-4049-8939-da5c8f5dcc6e	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-08 00:00:00.855852+00
c5ac306d-1cc2-4ab6-9ef9-2327baf55381	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
799ae571-e5b0-4f53-92fb-81c3a793e6b8	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-08 00:00:00.855852+00
8c3dcba9-a4a7-4cb5-9515-9627ebe3752b	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-08).	f	{"date":"2026-05-08","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-08 00:00:00.855852+00
fbcd11bb-6997-4b42-857d-e93e6faf367a	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	f	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
c1470f4c-f913-4466-ae59-1b7ea9d9df2f	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-08 00:00:00.855852+00
654acb53-185c-4f28-a83a-fa7ebadc85e3	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-08 00:00:00.855852+00
17340b4e-d873-4d9c-93b4-675aaabddd50	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-08 00:00:00.855852+00
dbc3a652-f2cd-4490-ace6-8aa9911e2eff	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-08). Please update your timesheet.	t	{"date":"2026-05-08"}	2026-05-08 00:00:00.855852+00
01b89377-723b-4afa-ac0d-a4f0c8ce2150	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-08 00:00:00.855852+00
83c583e2-93ae-4a3e-b5ca-dd0360a49665	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-08 00:00:00.855852+00
67ad637f-e443-42a9-87c3-1dff453978dd	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-08).	t	{"date":"2026-05-08","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-08 00:00:00.855852+00
38784012-a9bb-4225-9055-45735d24e4a3	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
3249b2aa-6bb8-43ee-afbd-c9f9292ac3d4	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-11 00:00:00.232847+00
f45a71db-1e72-4380-b703-d6c5c0461a9f	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
e4be55d9-94ac-4556-af07-36ef0bb458d7	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-11 00:00:00.232847+00
39e84efa-0c38-42fb-8683-98c27ebdbfc7	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
28054913-eaf4-4a18-9de6-64fec3d26b70	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-11 00:00:00.232847+00
d4bc5217-1166-4e20-8764-fd8d420aa9d5	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-11 00:00:00.232847+00
976d5755-a8d2-4362-875f-b6dbca4c15b2	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
733f25e4-fa18-44ec-beb9-6149770b07dd	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
37b92b4e-07f1-4bcc-85d2-e3eadade9aba	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
08bd7828-d0b5-400c-a6b9-afec32c0744b	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
f06358ef-fd92-416d-b8ab-712359e152c7	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
9bf7bd4a-9e72-42e4-bea3-ab5668f2bf7a	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
982cec0f-84b6-4ef5-bb78-0a8b660fb829	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
188478da-6871-4c7f-b393-02017e0fff57	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-11 00:00:00.232847+00
c7d5eaa5-2e01-4dd5-a613-258f55f84f03	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-11 00:00:00.232847+00
4a23c081-c4d4-4432-b922-98dc9021b4d1	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-11 00:00:00.232847+00
8e64637b-a7c9-4787-9353-420dee16755b	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-11 00:00:00.232847+00
da019055-92fb-4f50-a011-2d200f61e440	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
a9acdd49-feb9-4c8b-83df-e4e59cfffabf	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
11b3077a-4b0d-4b1a-afc6-bbcdb7cbd868	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-11 00:00:00.232847+00
846d1aca-bc00-492f-bc1b-0b21ff86407c	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
d2926127-0e36-4f54-9da3-c25c150dc72d	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-11 00:00:00.232847+00
ff661fbb-7335-4a45-b870-febf26444974	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-11 00:00:00.232847+00
67468155-b0fa-4b8d-9a84-35d3186e33a0	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-11 00:00:00.232847+00
4e295ccc-a9d2-4e38-9413-3ba4843e974c	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
b73e08a5-478d-4505-b2d2-f18e29957af3	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-11 00:00:00.232847+00
e0d73561-55d1-46f4-9383-293cc40bc3e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-11 00:00:00.232847+00
afed0f93-f351-4b53-a181-7b37c00f8dd9	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-11 00:00:00.232847+00
0898a6ef-816b-42e6-add0-3d64b977dca6	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-11 00:00:00.232847+00
fb6c8a94-0e9d-47c9-a443-3bff6b135163	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
307ee821-dc54-40f8-b77f-d4e4805ac4a3	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
9ffa5088-b3ba-4c6a-94f8-a6181cfaa1ed	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prabhjot Singh hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"4f980d85-4b3f-45d3-8163-4dad2e229146"}	2026-05-11 00:00:00.232847+00
0c83f8da-0aae-492a-9a34-018e46397ec5	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
2f50fa02-8718-4d7f-aee1-9a522f882df3	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-11 00:00:00.232847+00
63bc1742-429d-41c3-9a9c-61bb2dd8d3ce	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
6a4db208-8e89-46c7-b1e0-0675995bcece	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-11 00:00:00.232847+00
2d396a50-3cf6-440c-8835-9b69e96087cb	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
59ee2b1a-edcf-41bf-b0a9-8ceb171c1dff	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sourabh Kumar hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"7ba37884-75de-41db-b75a-5109880277a7"}	2026-05-11 00:00:00.232847+00
834fc3a7-fd36-4823-baf8-2d0b1f2b8c96	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
888a6816-f03b-454b-a57d-9379f549d268	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-11 00:00:00.232847+00
a9b8f1de-2255-4130-96be-3e96a60c14c2	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
5df6ebe7-88b8-4332-ad91-1ea883755213	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-11 00:00:00.232847+00
f1e31c95-954e-4001-87f8-2ba637019ce0	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
7a16a42b-3171-4388-a57e-05ab6d60fbab	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-11 00:00:00.232847+00
d133b8f7-597e-44f2-9adb-ff38925054b9	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
bd60631a-82bc-45ab-b6d8-5713deae9b09	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-11 00:00:00.232847+00
2bfd35cf-8f12-49cd-87c5-c6a7e62695cf	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
2dd801e3-dcf9-4291-bc6d-518c66fdf762	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-11 00:00:00.232847+00
ee552603-2455-4f3f-aeb4-ef85b221c4ef	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-11 00:00:00.232847+00
43063f27-630d-41e0-8118-7a55e75c15f5	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	t	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
48f66305-e158-4491-aac6-5e1e2024cd31	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-11 00:00:00.232847+00
af10f8a9-f826-471d-9e64-22f26e23f5a4	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
3abf12d8-9a0f-4dfb-9e96-69aa1987dfad	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-11 00:00:00.232847+00
5a60cee7-36a3-4a85-8241-566ce71c10e4	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
51505a4b-e85a-4d65-9481-e9851c7474ab	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-11 00:00:00.232847+00
29289a3d-8782-41e6-8f53-adbb64f4ede7	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-11 00:00:00.232847+00
e91be1fd-e2ae-4600-a0a2-4db9bb6d8da0	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-11).	f	{"date":"2026-05-11","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-11 00:00:00.232847+00
a221eb81-d985-4cb7-a830-f164ca56a945	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	f	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
24467442-e834-4670-ba45-eb26154642c4	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-11 00:00:00.232847+00
363f3301-66e9-44bc-ad60-a51615007685	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-11 00:00:00.232847+00
23d2a1f1-6c3b-44c5-bbb8-1506f03f4ae2	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-11 00:00:00.232847+00
375873bb-b530-4f40-bf8e-98263fae6f57	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-11). Please update your timesheet.	t	{"date":"2026-05-11"}	2026-05-11 00:00:00.232847+00
eaf4182d-345a-4cc2-be22-aa2ed902dd74	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-11 00:00:00.232847+00
5ab27e5a-09c8-437b-b25b-11106354267b	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-11 00:00:00.232847+00
d97c3e4c-db4e-441e-bca9-73a83120fcf5	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-11).	t	{"date":"2026-05-11","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-11 00:00:00.232847+00
70347f62-130c-4447-8800-03ae7a9bb688	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
0445b917-7da0-41ae-8460-c22fce3dcec5	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-12 00:00:00.244238+00
de81befd-2565-49f1-84c2-ca71233bdbbf	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
989cf1cd-c4a3-45ef-903b-5332cef20021	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-12 00:00:00.244238+00
f2e95ce8-a6aa-4d7f-a967-0212666c4005	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
bc9757d4-1f19-42d5-8def-618aeba5ee9f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-12 00:00:00.244238+00
59f1fc29-332c-44c6-92f4-3a355dba532a	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-12 00:00:00.244238+00
02218084-d798-48df-a835-c01441db46e5	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-12 00:00:00.244238+00
e9e90ad7-5677-4c09-ae27-489777f31103	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
ff402d79-ded6-483c-b1b8-4cfd4048a0e5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
ac8487b6-6f74-41d1-a6da-c51431f7bac6	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
ada7a568-ece6-45e6-b9d4-46dd666ba244	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
32d3aebf-3182-41d9-968c-7b43df267316	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
0941d1ae-b66f-4f3e-b468-fe1115531da5	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
75d3d28a-d45d-4d20-9f02-aea2075ec5f6	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
18cfa0d6-e83e-4fb9-abe3-0681329da85e	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
79678770-9cc6-4a5e-a2e8-dd939895669e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-12 00:00:00.244238+00
3a01a7e0-ef8e-46c0-b9cc-44c58c765c90	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-12 00:00:00.244238+00
2aeaa142-91b7-4b35-8139-fd2dbf6398a2	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-12 00:00:00.244238+00
a2e54a20-ce7e-482c-99be-fe7dfea4a92c	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-12).	t	{"date":"2026-05-12","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-12 00:00:00.244238+00
9704ffdb-2afe-441e-b171-63d96506fbc1	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-12 00:00:00.244238+00
30952192-6fc0-4874-bb5b-3e7c49bdfcf7	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
80a20712-f7b9-4b93-8d6f-8273ef331d7f	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-12 00:00:00.244238+00
56bc6a14-acec-438d-921d-5dfaf3861571	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
b523a7ce-4229-4543-a2ba-5295f08b8db2	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-12 00:00:00.244238+00
ea207e88-d45b-4479-92fd-99c616b7ed93	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-12 00:00:00.244238+00
2e29859b-d1a2-4a2b-8858-9ec3aadbd9f6	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-12 00:00:00.244238+00
40eabc04-a9f8-46c7-af8c-b2125614239c	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-12 00:00:00.244238+00
b0be0d79-1933-4af3-a6fb-f1eb242b3346	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
2336aff7-4b9e-4e9a-aeba-32083ea3da76	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-12 00:00:00.244238+00
d2e0cb30-6fdb-429b-8117-8c0920e44ae0	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
d70189c9-9e49-43dd-8f97-e39dfdf10e0f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-12 00:00:00.244238+00
89a134b0-9d6e-4978-8788-eb9b54707faf	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-12 00:00:00.244238+00
ce93602f-7e67-48f7-8b9f-b11367ae13ae	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-12 00:00:00.244238+00
4b1eafab-0612-4315-89a7-405337da832c	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
5a2ac70f-30f2-4ca2-bc34-e1026b3c7c14	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
63d8800a-5e4d-4483-a406-a9003ba383c1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prabhjot Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"4f980d85-4b3f-45d3-8163-4dad2e229146"}	2026-05-12 00:00:00.244238+00
47d61c23-adf8-4b1c-86d8-d4fd017d4193	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
4a9bc736-6b51-4734-a690-6c3932510135	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-12 00:00:00.244238+00
e0ac0d40-c70c-47b1-b1da-6d8516b9edb3	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
59d5db80-5550-46b2-a4b8-7c07490e81c8	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-12 00:00:00.244238+00
3de4bcae-7eb0-4f46-b1c1-c0209ea2b310	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
ccd1d0d1-7ab4-4ca2-af94-d9c1b080fb25	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sourabh Kumar hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"7ba37884-75de-41db-b75a-5109880277a7"}	2026-05-12 00:00:00.244238+00
c508ae42-a1c1-4a84-8d25-9d3c4ee9eff9	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
db7563f9-6fb5-4231-b432-b62a3f6a6ba5	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-12 00:00:00.244238+00
44625376-737c-4a1d-bc92-e5f4fdec48b1	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-12 00:00:00.244238+00
aacb8b9c-15cb-4cb5-a08a-a25395191bc2	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
c9488c23-25f6-4d55-a65e-c63922b0a1c2	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-12 00:00:00.244238+00
9f144740-638d-4669-831f-ee330cc14bc2	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
18c5a543-1a17-4100-b263-e8d1cd50de42	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-12 00:00:00.244238+00
8c5d7e72-19ab-4d03-8a1f-8c19df2b2ab4	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-12 00:00:00.244238+00
fc0cc3a9-599d-457c-b3dd-c56da60945d4	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
77f4acc6-a524-42f2-96e3-877ea6944f1f	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-12 00:00:00.244238+00
ff723e77-e609-468b-8062-06096d609c22	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
9831369a-8c07-435a-92e3-b05f4aeda1e4	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-12 00:00:00.244238+00
2f0258d2-e8b9-4e08-81b0-6b8f1ca318d2	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-12 00:00:00.244238+00
e6cda6cb-1983-4e5e-a5a9-485abe4df816	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-12 00:00:00.244238+00
81d31e6d-0e42-4832-9bce-f4b587f6f331	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-12 00:00:00.244238+00
b3e65825-6d39-4607-a36d-23689be980d5	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
c38d1e62-bc91-4b9c-927a-98950011d7fc	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-12 00:00:00.244238+00
044be98e-0d2a-4a12-99b5-3fa7dd9d0688	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
459c5395-613f-4c97-a471-57e186c9cdb8	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-12 00:00:00.244238+00
cc312db5-10d3-46bc-b650-7656009498c8	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-12 00:00:00.244238+00
30514f1f-0cf5-4803-a23c-843c1563a839	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-12).	f	{"date":"2026-05-12","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-12 00:00:00.244238+00
04886187-b89c-49c9-8736-41fbe356005a	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	f	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
aac249e7-85f4-4735-a141-c55625614945	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-12). Please update your timesheet.	t	{"date":"2026-05-12"}	2026-05-12 00:00:00.244238+00
e3065e7f-a161-466b-a71d-7ca541210f78	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	LEAVE_MARKED	Team Member Leave	Lakshman Praveen has marked leave for 2026-05-11.	f	{"memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0","date":"2026-05-11"}	2026-05-12 10:10:08.340711+00
d951ca8c-8862-4004-aa8e-e312d804be76	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
000262dc-30b5-4968-895e-74923c4f9c4f	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-13 00:00:00.385599+00
9291b819-bc33-4250-8bcc-0b32cfeda10a	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
870e6822-cc2c-4773-ad83-93fc9c5a18d9	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-13 00:00:00.385599+00
51f8dacd-f9c6-4432-805f-eb5694893566	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
80ee1af4-71c2-4de7-afec-302f37ad6103	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-13 00:00:00.385599+00
8021c984-3a24-4aa6-9d3a-d9e00ee530a5	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-13 00:00:00.385599+00
674c5c06-2ec6-425c-a416-9e4e52af585a	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-13 00:00:00.385599+00
168470f1-3b2d-499d-b62c-eb763b546a5d	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
3f79636a-9240-4dcf-9c6b-8de4da2b0f67	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
3ab2f13c-fb1b-48e7-b5e5-536d9ee7923e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
6b7ff095-fffb-4d8f-8863-e40a25863ff3	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
f31fd9db-a387-4568-9169-39c6f7f67c90	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
b10615a5-a752-485e-ac3b-70d592b14a71	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
d8c6ecd9-8ee5-45f4-b30c-081bba67a8f9	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
201fd29a-71ef-43ee-a72d-fcc0aa4d688a	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-13 00:00:00.385599+00
1db935cc-8dd3-486d-9960-750430cba550	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
86dd0c61-8da8-40fe-a89a-382fa3611d6e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-13 00:00:00.385599+00
0c960a4b-1e4d-4392-87e3-ff3f03044df3	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-13 00:00:00.385599+00
937ef632-2bd1-4400-8875-15adce9f79d5	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-13 00:00:00.385599+00
210fd3c0-a204-4344-9c05-f1759d397aa8	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-13 00:00:00.385599+00
5ee3caf9-05fb-48da-9b4f-701e1e313d16	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
28f618cb-49da-4d28-b5f7-8955e4a6be72	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-13 00:00:00.385599+00
6361a43f-2179-46f3-8de5-c12bc16a7626	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
ca690e9c-aad1-4acf-9171-df8d3a2b3d7a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-13 00:00:00.385599+00
44d95994-cac4-4744-adca-2f23a97b1598	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-13 00:00:00.385599+00
488774d4-0848-42b6-ad1d-853be73e4b44	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-13 00:00:00.385599+00
48c69813-a488-4b5a-bb4b-b6019e794397	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-13 00:00:00.385599+00
418fdc8e-cc0d-4749-be76-fe4d82a3f8eb	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
487e1219-ef95-4b86-813b-15ffc98b4ef2	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-13 00:00:00.385599+00
c738dd81-6e62-465d-b04f-9ed7c0e145d4	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
da586c08-8fbf-4a58-9536-1c79af8070b7	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-13 00:00:00.385599+00
ed1974e4-15bc-4a47-919d-4cc11a04ea5a	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-13 00:00:00.385599+00
9daae5ae-3b47-4329-8802-9c08aa56c5a2	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-13 00:00:00.385599+00
377bd72f-5f23-465d-8d61-f8451d690189	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
f1c4ecc0-013f-4bd7-82c8-8092eec7fe5b	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
bafe6bbd-201e-4d6b-a3c8-c8dd5b174c8a	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prabhjot Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"4f980d85-4b3f-45d3-8163-4dad2e229146"}	2026-05-13 00:00:00.385599+00
a44e62ce-abc8-49cd-83ad-2d454295dc9d	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
e004f761-36ec-443a-a8a9-31967be6dc8b	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-13 00:00:00.385599+00
75c60e0e-c3cc-4d23-9e85-696d23766501	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
c19c0be4-9273-48fd-af4f-1f9acf86229f	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-13 00:00:00.385599+00
cecd844c-df9f-43bd-a001-a972ab502e11	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
df65eb9c-f6dd-4b70-a607-607a1d2fe638	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sourabh Kumar hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"7ba37884-75de-41db-b75a-5109880277a7"}	2026-05-13 00:00:00.385599+00
8bf3fb28-1f24-4047-9d22-ecbd02f15c75	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
9e831f28-aa25-44aa-8c93-e638c94b6dbe	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-13 00:00:00.385599+00
1ff37956-f250-4335-8bc4-aabc2662dcac	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-13 00:00:00.385599+00
9ca4b10a-dc4c-4593-b473-b905190deefc	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
b657b499-d9a9-4d50-92ad-9f628139a0f5	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-13 00:00:00.385599+00
947e44af-eb2f-4691-8a05-43acfe13e777	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
fd967910-62cc-4760-8ed2-6afa58f11e3f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-13 00:00:00.385599+00
3d8c607b-a201-44ec-a115-cad9cd7b329d	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-13 00:00:00.385599+00
c45dd709-aed5-4139-8578-937826b60d50	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
def44fba-72de-4556-b453-308ddd33e8f8	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
9bfe9abf-c8f7-40d0-bc15-186d73b09748	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-13 00:00:00.385599+00
b1852f42-8e62-45ba-84f6-5fcc1207b983	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
e8d2ff3e-7625-4f1b-b113-76175d95fb01	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-13 00:00:00.385599+00
84cf4ef6-6a8b-43fb-9983-8f448e798aab	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-13 00:00:00.385599+00
b704e7a9-638f-4cdc-8ae0-30eed7727745	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-13 00:00:00.385599+00
2753005e-2e76-4d59-abf5-c2ba43604d74	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-13 00:00:00.385599+00
522e8996-4b86-4e81-b0e1-ab4b7cc9f737	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
6f219a45-a4ce-40a7-b7f3-f417bf403a9e	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-13 00:00:00.385599+00
7fa1583d-5bb2-42a0-9a05-65b1ee670ed3	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
faf93c72-1c55-45e5-9697-c364ac965779	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-13 00:00:00.385599+00
63c6ecc5-8951-4daa-a51e-cb44ee263025	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-13 00:00:00.385599+00
4bd19c16-06c0-4e68-ad3f-9a3ef7ec2d91	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-13).	f	{"date":"2026-05-13","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-13 00:00:00.385599+00
f51337b4-2849-4c00-9a8d-fb6d0d705547	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-13). Please update your timesheet.	f	{"date":"2026-05-13"}	2026-05-13 00:00:00.385599+00
5d8bff00-1183-4a8d-a1d7-1720d27c96ff	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
33b5bcb9-13ea-4678-bbaa-d80c60ff4531	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-14 00:00:01.008501+00
90e0c5b1-48f0-40d0-8b6c-e0abae3f404b	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
46655969-9102-47cd-b5f9-2fe8215f0cce	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-14 00:00:01.008501+00
567244d6-a085-42ee-b4b4-7ab8105a9251	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
31868f89-c3b9-4342-96ae-df6453422419	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-14 00:00:01.008501+00
700020ee-c7bc-4b28-bca7-1760c1dc60c7	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-14 00:00:01.008501+00
e984c534-fa6e-4f7c-bcd5-10c81d8d706c	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-14 00:00:01.008501+00
8d48d5dd-e5b4-4d8c-a7f5-1c5e75d32a47	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
9efec2f7-38b7-4feb-8650-092cf366fb9a	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
3816abf5-4876-4e3f-9681-344d03059ccb	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
245bddbd-94bf-455b-9ecf-379568f35480	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
03ab3b6c-1ce5-42f7-8cb0-42aa3402be2c	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
509aafa6-6c12-4aa5-a566-3100c0b8e4d3	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
fe1743da-1fe9-462e-b7e8-ee5fa69325bd	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
7076a361-735a-436a-a546-149223c28c0d	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-14 00:00:01.008501+00
927131c7-dee1-442a-bc27-8cb039df63a7	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
9fdfb496-e693-4e01-856f-30f7e411fb44	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-14 00:00:01.008501+00
69d096de-7299-426a-8808-15cdd97f351a	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-14 00:00:01.008501+00
257d6c59-434a-4ebb-949a-248951d2bdaf	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-14 00:00:01.008501+00
41240385-2723-48e8-9e2b-40dabeb17056	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-14 00:00:01.008501+00
c7c86209-1935-4183-9bab-9a4cc05ca470	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
d8bb193f-8430-4ed2-a3a3-0a4f4582cd20	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-14 00:00:01.008501+00
55d9c331-c93f-448e-a7dc-9c7e777360d4	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
7673f9f0-4e5f-4250-b6ba-028971eeecb0	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-14 00:00:01.008501+00
32ba9d1d-6211-4477-850f-4b5bd57f8f94	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-14 00:00:01.008501+00
121cb260-737f-41dc-abaa-5a18f2694278	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-14 00:00:01.008501+00
baf4c38f-aafe-4b0c-8027-f5752404bdfa	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-14 00:00:01.008501+00
cd05faf9-cc71-459c-8b57-494099d85895	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
af7169c1-f8a2-4e09-9f21-d90dd53b1cc5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-14 00:00:01.008501+00
ce7252d3-63bd-4aab-afdd-e0be933bdf76	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
97459b5d-0339-41b5-b921-bd86104aa0df	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-14 00:00:01.008501+00
f34fa5a0-916b-4078-91e1-6e672e1737f1	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-14 00:00:01.008501+00
ed92b73c-92f6-4504-af44-3fc8c1f57b4c	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-14 00:00:01.008501+00
aa7dd593-81ba-4e92-bbfe-29ce90dbffae	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
b7edfe32-771f-4977-bffc-c2197c4aa59e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
f741e40e-6872-4314-a373-849d4041780c	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prabhjot Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"4f980d85-4b3f-45d3-8163-4dad2e229146"}	2026-05-14 00:00:01.008501+00
6f44724a-7f16-454b-90b4-e055c5686a46	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
49d46beb-4845-4cbf-875c-e62dda0e5392	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-14 00:00:01.008501+00
67c6d076-eafe-4cfc-87ec-8c04cfc44086	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
0470b117-a34f-49e9-a020-3bb173898830	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-14 00:00:01.008501+00
4bfdeca4-c0b5-424a-a529-b622b9ed967a	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
89473970-bb8f-4674-bb22-3bf30df9b9f1	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sourabh Kumar hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"7ba37884-75de-41db-b75a-5109880277a7"}	2026-05-14 00:00:01.008501+00
979a2a75-1f16-4c77-a346-a453988bf7ec	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
0e33b5fb-c795-4235-bbf0-0eeff5751ffa	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-14 00:00:01.008501+00
09655c36-b1af-4e4e-a3c3-fb7695a5d207	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-14 00:00:01.008501+00
a8fbd22a-1d6e-47a7-9d2d-d7798fa0b53a	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
722054f4-906b-43af-8a29-d42a48083513	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-14 00:00:01.008501+00
79e65955-74fd-48aa-ac3f-45e4ffdd3508	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
3a24461a-a7a0-4dcb-a703-e0473276480d	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-14 00:00:01.008501+00
dce22573-00c1-4045-98c6-bdc512b86bfa	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-14 00:00:01.008501+00
07d1f11b-61a2-41d4-af7c-28020024fd1d	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
b67c3b2c-6173-4072-bb15-fe1e651c5cff	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
27a00233-3855-4381-aea0-4ce9e82ff69f	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-14 00:00:01.008501+00
082bcb41-5d33-4b64-88a9-5776b9781bae	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
00cf5c78-6ea6-4f5b-8d22-4bf6d90532fb	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-14 00:00:01.008501+00
7c6744cb-d2aa-4b1d-9435-35878a584238	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-14 00:00:01.008501+00
67d2ffac-b9e6-4812-9f8a-f5dc62b38c6e	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-14 00:00:01.008501+00
44c41d4c-ea3b-4584-b96f-ab75bf80ea15	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-14 00:00:01.008501+00
2ba1cad5-252f-4dbb-aef5-8247e4b8a3f5	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
08f8b93e-c27b-46a0-a8a6-524cb4e99f59	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-14 00:00:01.008501+00
b471eade-07e7-44be-9c8a-1a5917cc286d	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
a127470e-be03-4806-b12e-b2be265e017e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-14 00:00:01.008501+00
427fe2f9-99fb-40df-b767-0cf26eaba3f3	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-14 00:00:01.008501+00
5a4ca94c-3f9d-4678-95d8-93743729a968	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-14).	f	{"date":"2026-05-14","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-14 00:00:01.008501+00
39d8013b-4a8b-42f2-8266-23b46833cc7b	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-14). Please update your timesheet.	f	{"date":"2026-05-14"}	2026-05-14 00:00:01.008501+00
e21972f7-e0d7-4414-9f07-209851870490	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
9a1bf128-71bd-4946-83c7-3b0a9502c84f	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-15 00:00:00.325597+00
b844b5f4-8ef2-4c21-b710-ee49eadf39a8	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
de607a7e-77c0-416f-a5c7-5e7c8153f6bd	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-15 00:00:00.325597+00
4c86d0b2-baa2-45a1-a14c-4e1446aaeedc	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
28b18bfa-07da-4b36-915e-98068a543631	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-15 00:00:00.325597+00
a975010d-b2cb-4f65-b762-a7da14007e3e	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-15 00:00:00.325597+00
0bc14730-3547-4570-9d52-cf934b64a0f4	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-15 00:00:00.325597+00
92e92ac8-6661-438e-a5a7-9662eae9916b	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
66acafa8-64d6-4f6a-b23a-202eb788168a	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
5664d505-2f97-446c-91fa-9ada25b41ad5	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
106f81ec-f8db-4440-9db1-f3dfe383484e	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
b3aa71db-a17f-4d3a-b6d6-468622250c9a	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
a42c0017-4143-4ab4-ae49-096b37da50e9	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
232767cb-f5da-446d-b787-152ac5a6cc2f	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
7b3b8968-e80f-490a-9365-8971c132ef0d	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-15 00:00:00.325597+00
8b26974e-f3ae-4d4b-9061-c1ee0e4b5f48	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
27de9102-ac3b-4999-8708-00261671a506	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-15 00:00:00.325597+00
c1a54822-a8ca-4728-aafc-532147872184	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-15 00:00:00.325597+00
095d2a71-d4c7-4c2e-b563-786c1d9892b4	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-15 00:00:00.325597+00
e21ed1dd-4c40-4106-a845-6e1111a58631	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-15 00:00:00.325597+00
172851a0-99ef-4232-8ed2-c983c7ac8c12	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
362020f1-7eae-434a-99b8-ec02463f4b18	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-15 00:00:00.325597+00
3839201d-e568-42aa-a782-9f19283c99b5	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
705d0199-6a66-4d9d-a6a4-099f9ee1c3f1	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-15 00:00:00.325597+00
4d4f26f6-e8fe-4d91-ba85-8fc4c8dba6c2	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-15 00:00:00.325597+00
7e43dfa8-0175-4fad-a69b-60cdf8710356	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-15 00:00:00.325597+00
320e3e6e-e1d3-4752-8098-20218467bbc5	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-15 00:00:00.325597+00
9989cef7-f980-4cea-965a-082c7fe65a9d	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
cb58e711-32c6-4ead-9cd9-dec92ae4e8ed	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-15 00:00:00.325597+00
56ed3666-10f3-4314-9120-e4ad33c583d3	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
0483ce77-7283-40a3-8b66-72c9924ea5ed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-15 00:00:00.325597+00
cdf968ef-13f4-49ba-88c7-a2e7a0ca8c2e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-15 00:00:00.325597+00
91837f35-6554-4fba-aa23-e4ed40f2c9c3	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-15 00:00:00.325597+00
9f6ae1f7-518c-40c3-9653-cc6d8907a1f2	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
dea5a1d9-2515-4dd8-b97f-192953ff6496	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
1669273b-acd1-47ca-9faf-a055b1e35555	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prabhjot Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"4f980d85-4b3f-45d3-8163-4dad2e229146"}	2026-05-15 00:00:00.325597+00
4e9285ef-f58a-44eb-8a72-9513e27b2c30	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
404e5c8a-0ebd-4ccb-ad94-f726df83aa84	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-15 00:00:00.325597+00
e43cfaf9-424b-4acb-bcf9-4fd6e2645751	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
6e84468f-11c1-479a-b859-879f2057f54c	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-15 00:00:00.325597+00
6ab5b39c-a7b2-4ea8-b2f5-6c813a44fd5d	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
5be1c911-a24d-448e-80f7-64a2d3afd47e	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sourabh Kumar hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"7ba37884-75de-41db-b75a-5109880277a7"}	2026-05-15 00:00:00.325597+00
1f51a34e-2bb4-4f9f-a2f4-bcdc535d630f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
dc2b623a-ebd6-493d-bf81-bd92c2fffbcb	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-15 00:00:00.325597+00
6f0d9839-421f-4539-a8c3-435523820ccb	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-15 00:00:00.325597+00
c78baa61-9058-4b83-bd56-f09e5799899b	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
fd0d3924-277e-4306-bdae-8a63d29e4bde	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-15 00:00:00.325597+00
88c1e663-9b68-4328-83a9-e2407c310537	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
f8bcf06f-6c2f-4379-8fcc-51256948d17e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-15 00:00:00.325597+00
6155d663-6646-40e9-8c7d-e9db215be8da	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-15 00:00:00.325597+00
fc3a3e39-e5a3-44fe-845f-59cc74a6e4f3	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
3753d1da-f5c8-4a1c-b1bf-57d905494bb8	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
e2c0483f-990f-4854-ac90-33561c785490	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-15 00:00:00.325597+00
6b5fe2b3-2029-47c2-809a-cea95050eb32	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
f4d1e793-b969-47e9-94a8-5c66f0322694	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-15 00:00:00.325597+00
485ce7d8-dbb7-48f5-8343-8ea1491dac59	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-15 00:00:00.325597+00
13d82619-3ef6-446a-bc33-94ff83feee45	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-15 00:00:00.325597+00
967d911b-40c5-46d9-96aa-5bdd63663a3d	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-15 00:00:00.325597+00
e23b674b-9ca3-4a15-ab5b-792f6b0cb65a	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
7ff1f040-8ec1-4c0c-9321-5d0de493dd82	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-15 00:00:00.325597+00
f5a5fcf1-0dd7-4f1a-b876-51f8f74d4f70	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
9f03b1da-16e5-43a7-af20-175c3287f4f8	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-15 00:00:00.325597+00
02b204e7-4b04-4952-a26b-d4296a647acb	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-15 00:00:00.325597+00
1b93d516-8182-4f26-be31-2f584f8d76ed	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-15).	f	{"date":"2026-05-15","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-15 00:00:00.325597+00
09f4b5ea-c238-4ce0-af9e-8d3d866235d1	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-15). Please update your timesheet.	f	{"date":"2026-05-15"}	2026-05-15 00:00:00.325597+00
64860fd8-53a7-4396-93d6-ffae63ee5fe7	8542caa8-697c-4064-a45b-fc8fd3ae2732	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
16cac0fd-4dca-48bb-8d18-bbfa624ca15a	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Banti Guleria hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"8542caa8-697c-4064-a45b-fc8fd3ae2732"}	2026-05-18 00:00:00.828095+00
4ed350ff-918a-4548-920f-eb8715db0fee	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
8bfa8885-30f9-4e9f-af63-61e761d786cb	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Anubhav Rana hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"448b84b7-13a1-43fe-a9de-39c5fcf9d95e"}	2026-05-18 00:00:00.828095+00
8e30a0cd-1162-4873-8bcb-d9719d44aa20	f63c91c3-a4fa-4467-a2d6-af128a176eed	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
a94e2265-8cdc-4d53-be4b-92ed55e49456	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-18 00:00:00.828095+00
f03d5cb1-e02f-4b48-8e35-d037b44d1b57	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-18 00:00:00.828095+00
0d6d3efd-03dc-4564-a818-47b4387c7cbb	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Umesh kumar hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"f63c91c3-a4fa-4467-a2d6-af128a176eed"}	2026-05-18 00:00:00.828095+00
616319ef-cd1b-4127-9866-6a1b2e22468b	7378db3c-09c2-46f8-b28a-a8a1e86f8822	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
82cb9128-1307-470a-b821-ee9138b6dc59	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
928ba14b-c0a5-47d6-a92f-27da328831af	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
2f64fbad-5856-4b7a-a72b-8339e4144f39	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
4863ef79-9418-46f1-a272-fde2e6ee0665	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
1cbf6c31-8f23-4c0f-a748-bf977b8c5802	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
f7157543-5117-4e2f-b5eb-3ea411054a64	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
38b5e8a8-24b3-41b0-b1f6-ae5c905bf3c5	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Sumit Gupta hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7378db3c-09c2-46f8-b28a-a8a1e86f8822"}	2026-05-18 00:00:00.828095+00
5e74b7a7-a329-4190-8196-4bb0673a9797	59a2f8c6-0356-4749-8737-39c7d8946a57	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
6a01e0cb-a28b-47b7-9ace-b8bf5a40bac5	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-18 00:00:00.828095+00
4ade7420-a990-4041-bd55-adca8afe3599	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-18 00:00:00.828095+00
bc04138b-97cb-415a-957c-9fe7402eefa4	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-18 00:00:00.828095+00
026920c5-ccdb-4f42-bf68-87bb5fdfe385	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Jaspal Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"59a2f8c6-0356-4749-8737-39c7d8946a57"}	2026-05-18 00:00:00.828095+00
3721945b-7579-4c8b-8649-81b768891f63	edc8df9b-d12e-4108-8a63-a3eb02084015	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
87900556-a919-4e31-8d99-9510127c868e	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Sushil Kumar hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"edc8df9b-d12e-4108-8a63-a3eb02084015"}	2026-05-18 00:00:00.828095+00
4aa98715-3751-4f99-8b00-1768f5f2ee29	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
a9c94803-4726-4c9b-94b8-896d4e48a279	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-18 00:00:00.828095+00
8ef0fd67-02de-40c7-8824-90c7411358b8	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-18 00:00:00.828095+00
59783916-143a-4e23-b9ab-50baea9c5318	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-18 00:00:00.828095+00
214e7048-e1fc-45e9-84bb-fbe5345d7c44	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Abhay Munj hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce"}	2026-05-18 00:00:00.828095+00
e2f69133-f7d1-4f48-8908-ad23bde3c713	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
6821c62f-a052-4c29-a717-617e49024d21	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Ravi Pal hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"bbc22e4a-d673-4fe7-87d1-a6fafdb3a009"}	2026-05-18 00:00:00.828095+00
05ba2eae-319d-4305-8e81-42dd5f1c7fef	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
b65d0e85-c55b-4fcc-a626-b3f1df631d4c	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-18 00:00:00.828095+00
cee6871d-56c3-4fd9-94f6-f74ad44277d4	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-18 00:00:00.828095+00
3f9375b8-2f58-477c-a945-d4f546557522	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Kumar Viswa hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e"}	2026-05-18 00:00:00.828095+00
1360a724-fa8c-49bc-a17e-bcbbcd64da87	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
6db685ab-e95f-402e-a81d-92c10cee1dd8	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
83e305a5-4798-42d6-bf92-e1ecae562685	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prabhjot Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"4f980d85-4b3f-45d3-8163-4dad2e229146"}	2026-05-18 00:00:00.828095+00
b569d149-858c-4773-898e-3daa04250c55	55f65491-5988-4d63-928c-ad873d9fa687	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
1cfb4147-c4a7-43ee-9a5a-127dd4a1ebeb	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	kiran aryal hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"55f65491-5988-4d63-928c-ad873d9fa687"}	2026-05-18 00:00:00.828095+00
c34c4307-3cfa-4aea-b7c0-477033c10bce	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
91752344-af41-4ff6-b02f-052975b027a4	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	harish sharma hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513"}	2026-05-18 00:00:00.828095+00
618bb362-7692-4d4d-b3e2-746326ca396b	7ba37884-75de-41db-b75a-5109880277a7	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
2ad9d550-8186-4b4b-b965-52a80a029385	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Sourabh Kumar hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"7ba37884-75de-41db-b75a-5109880277a7"}	2026-05-18 00:00:00.828095+00
8aafa5c4-d0f4-474b-94dd-3de249a65d7b	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
553f7306-c5a5-4a79-9c6a-35b1b90cf68e	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-18 00:00:00.828095+00
450af759-8d9a-4ba4-871b-cba45d3aadad	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Gaurav Dhiman hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"244865e0-bd63-4df2-bab6-bfb1cd2799e3"}	2026-05-18 00:00:00.828095+00
ffa4678c-35de-4691-b7d0-0f3a9ac10f9d	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
50ea7631-a8fe-4ef7-8100-862859ca0d51	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Hitender Kumar hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1"}	2026-05-18 00:00:00.828095+00
5e1bc6c8-7fa4-44f2-b292-e2e93484577f	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
d4f75be2-5919-42d2-b26c-17591fdfb49d	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-18 00:00:00.828095+00
d88cbe17-cdf7-4625-9701-79499ef57fb5	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Navjot Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"db5035c0-8ff3-486e-8a7b-ba77a09c1a78"}	2026-05-18 00:00:00.828095+00
f7b54e10-e981-409d-8b5e-bb83e23537cf	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
26e2440c-716c-4194-b5cf-dac2d84e7dde	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
45827b0d-f3cf-41db-a964-49df3a356b5d	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Lakshman Praveen hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0"}	2026-05-18 00:00:00.828095+00
47454810-6d67-4003-9e41-0c1beec20de1	a559faec-6ba3-4459-81b0-748686373bbc	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
f5bf76bf-410a-429e-814e-481e5240ef19	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-18 00:00:00.828095+00
a82f115d-56ee-428f-87d4-5e249d25f254	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-18 00:00:00.828095+00
2f72e9ca-74ff-4b38-b09f-e6af1eb853ea	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-18 00:00:00.828095+00
b0e30264-f204-4c4e-8565-ce724dc610fb	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	NO_TIMELOG	Team Member Missing Time Log	Deepak Bisht hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"a559faec-6ba3-4459-81b0-748686373bbc"}	2026-05-18 00:00:00.828095+00
871418ec-eb71-4b36-8cdc-1e6b5c791cc4	32b4295b-7776-4398-b60c-9f91b078bbb8	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
480977f3-551a-4aa5-9951-1f99c963de52	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	NO_TIMELOG	Team Member Missing Time Log	Bhinder Singh hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"32b4295b-7776-4398-b60c-9f91b078bbb8"}	2026-05-18 00:00:00.828095+00
ed880a84-c482-4f85-affe-e06d2767a92b	e219e6a1-91c8-4183-8d7c-ed51e992c438	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
1cdfdc22-34f9-468c-bcf5-164f1f01f093	244865e0-bd63-4df2-bab6-bfb1cd2799e3	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-18 00:00:00.828095+00
5b930992-fb8e-4ef0-b678-452adc550ee0	4f980d85-4b3f-45d3-8163-4dad2e229146	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-18 00:00:00.828095+00
2a7ff01a-f380-42f8-bf6d-f88c32d6c0d1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	NO_TIMELOG	Team Member Missing Time Log	Prince Shah hasn't logged any time today (2026-05-18).	f	{"date":"2026-05-18","memberId":"e219e6a1-91c8-4183-8d7c-ed51e992c438"}	2026-05-18 00:00:00.828095+00
77df8ca8-0861-49cf-9597-abc3062697ba	6b38dbc1-85cd-4249-aa9f-0aaa4f879605	NO_TIMELOG	Missing Time Log	You haven't logged any time today (2026-05-18). Please update your timesheet.	f	{"date":"2026-05-18"}	2026-05-18 00:00:00.828095+00
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.otps (id, email, otp_code, purpose, is_used, used_at, expires_at, created_at, deleted_at) FROM stdin;
e196dc6e-99a2-413e-b543-ea979abb43ef	prabhjot.s@idsil.com	452105	LOGIN	t	2026-04-28 05:19:15.949+00	2026-04-28 05:23:51+00	2026-04-28 05:18:51.004985+00	2026-04-28 05:25:00.286+00
f39e81b2-71da-4335-be95-a1ea13fa25e6	prabhjot.s@idsil.com	365662	LOGIN	t	2026-05-08 05:55:27.503+00	2026-05-08 05:59:59.944+00	2026-05-08 05:54:59.951569+00	2026-05-08 06:00:00.457+00
5cd761d7-f845-48fd-93a7-d98327875d60	sumit.singh@idsil.com	348964	REGISTER	f	\N	2026-05-18 04:45:56.861+00	2026-05-18 04:40:56.866449+00	2026-05-18 04:40:56.904+00
56991142-083a-4e80-ae19-9f80be9d3f99	sumit.singh@idsil.com	682074	REGISTER	f	\N	2026-05-18 04:45:56.904+00	2026-05-18 04:40:56.907922+00	2026-05-18 04:50:00.743+00
b963b884-43f4-456c-932c-a45d5e10002e	deepak.k@idsil.com	115316	PASSWORD_RESET	f	\N	2026-05-18 04:46:31.366+00	2026-05-18 04:41:31.373263+00	2026-05-18 04:50:00.743+00
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.permissions (id, key, description) FROM stdin;
97da5d74-aec1-4a06-a9e0-77390a63a1f2	user:view	View users
d21c2166-9724-4b00-a221-94a82bc6615f	user:create	Create users
357870c2-b190-44c4-9a61-ea366ac2e33a	user:manage	Manage users
5fda3e66-8ac2-40e5-b85c-3e4f73f5057a	user:edit	Edit users
d4e20023-8184-41d3-873e-76ff73c8532b	user:delete	Delete users
144cd0cc-4b05-464d-ae73-8b7650c55d56	role:view	View roles
1ce00c3f-3e80-4127-8583-da37e664ec2d	role:create	Create roles
e85518b9-db01-4cc0-8faf-66add3ab672d	role:manage	Manage roles and permissions
bbb61db9-014c-4be8-aad1-31f86e9ff7ab	project:view:all	View all projects
5b164123-fc9a-4cdb-add3-473be7d82310	project:view:my	View my projects
430cbfd7-2bb3-49c5-b571-4a91576bd5ad	project:create	Create projects
d1d95d2f-fbf8-4bfc-80fc-8273c3bcc392	project:manage:all	Manage all projects
12a60d18-400d-4761-838d-4c73a096e778	project:manage:my	Manage my projects
8ca49db3-f4d8-4bcd-949c-f75d4093813e	tasks:view:all	View all tasks
8b0baff7-3ae2-4976-8417-9d1fb190a5ac	tasks:view:project	View tasks within assigned projects
34ab2826-4210-423f-81f8-76a0a62a6727	tasks:view:assigned	View tasks assigned to you
b35ddcf1-a2f8-4508-8765-b951fe9105fc	tasks:create	Create tasks
8e2408fb-352b-4cc0-b44c-95b224640d34	tasks:assign	Assign tasks to other users
6846e36d-6f5d-47e6-8c72-1f7942f3033d	tasks:edit:all	Edit all tasks
d9357f88-40c4-46e5-afa4-ced49a7b8d3d	tasks:edit:project	Edit tasks within assigned projects
da011b8a-ff07-40cd-b666-b07048067770	tasks:edit:assigned	Edit tasks assigned to you
ef582365-0473-4c92-96b6-c914bf9524f5	tasks:delete:all	Delete all tasks
0c630fe9-08ba-4c3f-a48a-349ae7cfddcb	tasks:delete:project	Delete tasks within assigned projects
80e9cd61-f948-4630-98f7-38a56b033538	tasks:delete:assigned	Delete tasks assigned to you
8907d014-bebe-406d-b818-b83754bd82fb	timelog:view	View time logs
7c0224a5-551d-4bd6-ac70-7d0506dbca0d	timelog:create	Create time logs
0d2db4c8-accf-41af-97cc-83a3c0774a13	timelog:edit	Edit time logs
79cdb1b8-7ddb-4869-815d-68d36a3882d9	timesheet:view	View timesheet
4dec445a-ba3a-4f15-98c8-036ffeb6d459	timesheet:manage	Manage team timesheets
53ec937c-4142-4cde-ad36-a36cfc78e938	analytics:view	View analytics
e0b307d2-8643-4448-9069-abca81357c7a	client:view:all	View all clients
cbe0b1d3-6101-412a-a1a1-533e5415f39c	client:view:my	View my clients
b30623ac-ff57-4605-a1f0-048599b7fd19	client:manage:all	Manage all clients
6717c5d6-0404-4760-985c-00d48cf0ef3d	client:manage:my	Manage my clients
cf0f6d98-0924-4d55-87ca-23268e5f18cf	client:create	Create clients
9b34dc8c-4918-48c0-98dc-f55ab2791fe5	dashboard:view	View dashboard
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.project_members (id, project_id, user_id, role, hourly_rate, created_at, updated_at) FROM stdin;
e7b01fcb-8781-4fa3-9a5f-1a0e8476977d	70f5be23-a5e3-4b1b-acd3-40a5ff06b9d4	4f980d85-4b3f-45d3-8163-4dad2e229146	MANAGER	0.00	2026-04-28 05:13:21.530465+00	2026-04-28 05:13:21.530465+00
63919b75-fee6-4224-8816-a9c64e753b90	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	8542caa8-697c-4064-a45b-fc8fd3ae2732	MANAGER	0.00	2026-04-28 05:45:50.756753+00	2026-04-28 05:45:50.756753+00
5e1c30e7-6b2e-437d-bf05-11aa8e232046	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	4f980d85-4b3f-45d3-8163-4dad2e229146	LEAD	9.00	2026-04-28 05:45:50.756753+00	2026-04-28 05:45:50.756753+00
687be1b4-45ad-4337-a597-fd7f902ab6ec	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	e219e6a1-91c8-4183-8d7c-ed51e992c438	MEMBER	9.00	2026-04-28 05:45:50.756753+00	2026-04-28 05:45:50.756753+00
326bf83e-0815-4be3-97a9-43a4742f481c	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	59a2f8c6-0356-4749-8737-39c7d8946a57	MEMBER	9.00	2026-04-28 05:45:50.756753+00	2026-04-28 05:45:50.756753+00
067c97b5-4792-49e3-ad12-2244eca1adfb	e52617ba-6e0c-44b9-b91a-a90c4188571b	8542caa8-697c-4064-a45b-fc8fd3ae2732	MANAGER	0.00	2026-04-28 05:47:32.966352+00	2026-04-28 05:47:32.966352+00
3aa03a21-cf05-44b7-8cbb-f40f8ef0a8ce	e52617ba-6e0c-44b9-b91a-a90c4188571b	4f980d85-4b3f-45d3-8163-4dad2e229146	LEAD	9.00	2026-04-28 05:47:32.966352+00	2026-04-28 05:47:32.966352+00
82ff3187-3916-4acf-980a-9262006820c5	e52617ba-6e0c-44b9-b91a-a90c4188571b	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	MEMBER	9.00	2026-04-28 05:47:32.966352+00	2026-04-28 05:47:32.966352+00
cf58858e-5661-4e12-818a-c22ce650a475	e52617ba-6e0c-44b9-b91a-a90c4188571b	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	MEMBER	5.00	2026-04-28 05:47:32.966352+00	2026-04-28 05:47:32.966352+00
20889fb2-bd1b-4d69-a178-cd5299b52652	a1e9d1a5-7d52-4eea-90ab-ca5c84a999d5	4f980d85-4b3f-45d3-8163-4dad2e229146	MANAGER	0.00	2026-04-29 09:51:56.673193+00	2026-04-29 09:51:56.673193+00
8ea97021-db20-4b78-a5d5-e65266762fda	57748614-2f43-4bc1-8df4-501a242164e1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	MANAGER	0.00	2026-04-30 04:35:57.391791+00	2026-04-30 04:35:57.391791+00
7763a723-d894-4b6d-bdd6-e9d509213807	57748614-2f43-4bc1-8df4-501a242164e1	4f980d85-4b3f-45d3-8163-4dad2e229146	LEAD	9.00	2026-04-30 04:35:57.391791+00	2026-04-30 04:35:57.391791+00
43cea204-6983-49c3-9e6d-355cabc10023	57748614-2f43-4bc1-8df4-501a242164e1	a559faec-6ba3-4459-81b0-748686373bbc	MEMBER	9.00	2026-04-30 04:35:57.391791+00	2026-04-30 04:35:57.391791+00
fa348103-382f-40e7-9e39-af7b69d0d246	57748614-2f43-4bc1-8df4-501a242164e1	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	MEMBER	9.00	2026-04-30 04:35:57.391791+00	2026-04-30 04:35:57.391791+00
f267fcf6-df05-46bd-a7cb-da06117d8dd1	57748614-2f43-4bc1-8df4-501a242164e1	59a2f8c6-0356-4749-8737-39c7d8946a57	MEMBER	9.00	2026-04-30 04:35:57.391791+00	2026-04-30 04:35:57.391791+00
dae86536-cfdc-4ffb-bdd2-0ea966b84b34	da2d585f-0d82-4023-b47c-e2e410bfea8a	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-01 06:20:54.692655+00	2026-05-01 06:20:54.692655+00
f3cb95a2-700b-4884-9eed-e5121698b957	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	LEAD	25.00	2026-05-01 06:20:54.692655+00	2026-05-01 06:20:54.692655+00
7750688e-1075-49f9-a22f-1b262f12a531	da2d585f-0d82-4023-b47c-e2e410bfea8a	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	MEMBER	15.00	2026-05-01 06:20:54.692655+00	2026-05-01 06:20:54.692655+00
e9979ff9-fa77-4724-a145-ba39efab9faa	da2d585f-0d82-4023-b47c-e2e410bfea8a	a559faec-6ba3-4459-81b0-748686373bbc	MEMBER	15.00	2026-05-01 06:20:54.692655+00	2026-05-01 06:20:54.692655+00
fbe1f664-2697-417a-98e2-ec9cfd631f9c	da2d585f-0d82-4023-b47c-e2e410bfea8a	e219e6a1-91c8-4183-8d7c-ed51e992c438	MEMBER	15.00	2026-05-01 06:20:54.692655+00	2026-05-01 06:20:54.692655+00
0d7c0a17-c3fc-41aa-b8d6-416d42a0ed52	720d14b4-711a-4b87-8ad1-3b1208fabaed	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
c5375279-8aa8-4654-9eb9-3c247144d342	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	LEAD	20.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
693f5a90-984a-46f1-8df6-a507522ae909	720d14b4-711a-4b87-8ad1-3b1208fabaed	db5035c0-8ff3-486e-8a7b-ba77a09c1a78	LEAD	20.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
25501738-31be-4fb1-babf-b6596b223219	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	LEAD	20.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
46f0360c-b89d-44e8-b994-9866bbb6f7a1	720d14b4-711a-4b87-8ad1-3b1208fabaed	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	MEMBER	18.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
f4d5f449-0785-4cec-a813-ff7e9e8c43c3	720d14b4-711a-4b87-8ad1-3b1208fabaed	a559faec-6ba3-4459-81b0-748686373bbc	MEMBER	20.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
21a370c7-e731-4274-877f-26aa9ac63143	720d14b4-711a-4b87-8ad1-3b1208fabaed	59a2f8c6-0356-4749-8737-39c7d8946a57	MEMBER	18.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
c82b0b2e-cd2e-4e84-b823-73d9131459b6	720d14b4-711a-4b87-8ad1-3b1208fabaed	f63c91c3-a4fa-4467-a2d6-af128a176eed	MEMBER	20.00	2026-05-01 06:24:21.052449+00	2026-05-01 06:24:21.052449+00
15f059cc-fb65-46a9-82e2-83db98ec953f	c107877f-589a-4710-bb69-de69bc8921ca	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-05 08:30:00.286149+00	2026-05-05 08:30:00.286149+00
5c13d1a9-6a9c-4c13-9bd3-69d2d5090f78	c107877f-589a-4710-bb69-de69bc8921ca	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	LEAD	25.00	2026-05-05 08:30:00.286149+00	2026-05-05 08:30:00.286149+00
ec656249-c2df-4bfa-a850-721543d1425b	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-06 04:38:37.43045+00	2026-05-06 04:38:37.43045+00
8cbe78af-ee56-4637-9963-c26eb7d83cfa	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	LEAD	10.00	2026-05-06 04:38:37.43045+00	2026-05-06 04:38:37.43045+00
8cb9583f-0cef-407a-9074-7dce9c6df6c6	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	32b4295b-7776-4398-b60c-9f91b078bbb8	MEMBER	10.00	2026-05-06 04:38:37.43045+00	2026-05-06 04:38:37.43045+00
36980ae1-af17-43f8-a010-c3b12a24102a	ef04818d-604c-43e3-939a-34c1ef5661c5	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
2922f443-f13e-4d85-b8d5-fc34bc3641cd	ef04818d-604c-43e3-939a-34c1ef5661c5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	LEAD	50.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
96e53eb8-e8bf-45c7-9ecc-ea85c08b24be	ef04818d-604c-43e3-939a-34c1ef5661c5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	MEMBER	10.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
b1d2a7d4-23bb-4616-82e5-3a2785250ba7	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	MEMBER	10.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
a2733905-e895-4a55-8b1a-26c9716136a4	ef04818d-604c-43e3-939a-34c1ef5661c5	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	MEMBER	10.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
58ff210b-5c58-43a3-87fb-4fe58c640d85	ef04818d-604c-43e3-939a-34c1ef5661c5	55f65491-5988-4d63-928c-ad873d9fa687	MEMBER	10.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
bd6b6150-8456-4ada-ad44-82c823470d6d	ef04818d-604c-43e3-939a-34c1ef5661c5	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	MEMBER	10.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
4ec312d8-8050-4e5b-b140-7fef0e8ec2e3	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	MEMBER	10.00	2026-05-06 06:48:25.126049+00	2026-05-06 06:48:25.126049+00
cd7be2d1-3e95-4b6e-910a-e5a7637a24f6	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-07 07:22:20.072522+00	2026-05-07 07:22:20.072522+00
999c38c5-cad6-469d-8350-f56ac2b763c0	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-08 05:59:07.080859+00	2026-05-08 05:59:07.080859+00
5b478091-494d-4893-ab0d-28066791afd2	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	4f980d85-4b3f-45d3-8163-4dad2e229146	LEAD	30.00	2026-05-08 05:59:07.080859+00	2026-05-08 05:59:07.080859+00
f14ce8aa-10c0-48ca-8f33-ac34455ebd37	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	7ba37884-75de-41db-b75a-5109880277a7	MEMBER	20.00	2026-05-08 05:59:07.080859+00	2026-05-08 05:59:07.080859+00
ef9464f2-542e-4c0a-81db-04803930b45e	a706bc8d-ad1e-42f7-af77-ab55add6075d	7378db3c-09c2-46f8-b28a-a8a1e86f8822	MANAGER	0.00	2026-05-08 06:05:57.195147+00	2026-05-08 06:05:57.195147+00
48ba2643-72e6-4824-b7c6-c12364f51cc0	a706bc8d-ad1e-42f7-af77-ab55add6075d	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	LEAD	30.00	2026-05-08 06:05:57.195147+00	2026-05-08 06:05:57.195147+00
3c3c7967-2f07-4e29-82e9-1b0b6f87aa2d	a706bc8d-ad1e-42f7-af77-ab55add6075d	e219e6a1-91c8-4183-8d7c-ed51e992c438	MEMBER	20.00	2026-05-08 06:05:57.195147+00	2026-05-08 06:05:57.195147+00
0944e42e-ffc3-4411-ae59-f8dfbba17946	a706bc8d-ad1e-42f7-af77-ab55add6075d	4f980d85-4b3f-45d3-8163-4dad2e229146	MEMBER	20.00	2026-05-08 06:05:57.195147+00	2026-05-08 06:05:57.195147+00
ca317f54-fd16-4960-ac11-283129997766	06063b94-3b48-48bf-bccb-c8712a61000d	4f980d85-4b3f-45d3-8163-4dad2e229146	MANAGER	0.00	2026-05-08 06:21:37.949571+00	2026-05-08 06:21:37.949571+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.projects (id, name, project_code, description, client_id, project_manager_id, status, priority, start_date, end_date, created_by, created_at, updated_at, deleted_at) FROM stdin;
f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	Calarity	PRJ-002	Medical & Health Care	bd33648f-1b84-498c-8a9d-a0dfc95301d2	8542caa8-697c-4064-a45b-fc8fd3ae2732	active	HIGH	2026-04-28	2026-04-30	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:45:50.748912+00	2026-04-28 05:45:50.748912+00	\N
e52617ba-6e0c-44b9-b91a-a90c4188571b	Blunox	PRJ-003	Data Safety	d70c214e-8570-43aa-a64b-26ad9cd2e9f3	8542caa8-697c-4064-a45b-fc8fd3ae2732	active	MEDIUM	2026-04-28	2026-04-30	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:47:32.959559+00	2026-04-28 05:47:32.959559+00	\N
a1e9d1a5-7d52-4eea-90ab-ca5c84a999d5	Prabhjot personal Project	PRJ-004	Prabhjot personal Project	b9596996-5c82-48a9-bbbb-f6156766a35e	4f980d85-4b3f-45d3-8163-4dad2e229146	active	MEDIUM	2026-04-01	2027-04-29	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-29 09:51:56.664062+00	2026-04-29 12:31:12.531+00	2026-04-29 12:31:12.531+00
57748614-2f43-4bc1-8df4-501a242164e1	HierSearch	PRJ-005	Legal	bd33648f-1b84-498c-8a9d-a0dfc95301d2	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	active	HIGH	2026-04-30	2027-04-30	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-30 04:35:57.38244+00	2026-04-30 04:35:57.38244+00	\N
da2d585f-0d82-4023-b47c-e2e410bfea8a	Intellix	PRJ-006	Intellix company have 4 different project interlink with each other.\n1. blucygnus.ai (brand website)\n2. Bluknox.com (main project website)\n3. Bluknox window installer\n4. Bluknox mac installer	d70c214e-8570-43aa-a64b-26ad9cd2e9f3	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2024-12-01	2027-05-01	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:20:54.684418+00	2026-05-01 06:20:54.684418+00	\N
720d14b4-711a-4b87-8ad1-3b1208fabaed	Advilex	PRJ-007	We are maintaining SCM portal for the advilex client.	730d75c5-2a74-40b1-b25e-1b6549c1dcbf	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2025-04-09	2030-04-30	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:24:21.043442+00	2026-05-01 06:24:21.043442+00	\N
c107877f-589a-4710-bb69-de69bc8921ca	Advilex AI Mining	PRJ-009	AI based data extraction	730d75c5-2a74-40b1-b25e-1b6549c1dcbf	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2026-04-06	2026-06-30	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	2026-05-05 08:30:00.275704+00	2026-05-05 08:30:00.275704+00	\N
ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	CASAI	PRJ-010	Construction domain	b98ccf00-5331-4372-9683-8dd0f787310a	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2019-04-15	2030-01-31	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-06 04:22:09.297173+00	2026-05-06 04:38:37.417+00	\N
ef04818d-604c-43e3-939a-34c1ef5661c5	Chemwatch	PRJ-008	Chemwatch provides holistic solutions to chemicals management, with a range of software packages suitable for small businesses to global enterprises.	c536be38-618f-4af2-ab89-18276458ab2f	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	HIGH	2026-04-01	2027-04-01	05e8fadc-6037-48ec-8b55-bf87346c431e	2026-05-05 06:47:56.360043+00	2026-05-06 06:48:25.111+00	\N
49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	Project & Team Management	PRJ-011	For IDS Routine Tasks	80c3fe5b-262f-4dba-88a0-b30f4c6b95a1	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2026-04-01	2031-03-31	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-07 07:22:20.064373+00	2026-05-07 07:22:20.064373+00	\N
22be8e7b-c8ee-43b8-a387-4ee86b200ccd	TECLA - Working Hours Compliance & Planning Platform	PRJ-012	TECLA - Working Hours Compliance & Planning Platform	b13b14ed-62f6-4036-8aef-db38283798fe	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2026-05-01	2026-07-31	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 05:59:07.072419+00	2026-05-08 05:59:07.072419+00	\N
70f5be23-a5e3-4b1b-acd3-40a5ff06b9d4	Test	PRJ-001	sdfsf	f6bf527a-d71b-4cf1-b2c2-bef799277dc9	4f980d85-4b3f-45d3-8163-4dad2e229146	active	MEDIUM	2026-04-28	2027-04-27	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-28 05:13:21.519915+00	2026-05-08 06:03:15.242+00	2026-05-08 06:03:15.242+00
a706bc8d-ad1e-42f7-af77-ab55add6075d	Timesheet Management System	PRJ-013	A Timesheet Management System helps organizations track employee working hours, tasks, and project progress efficiently in one centralized platform.\nIt streamlines attendance, payroll processing, and productivity monitoring while improving accuracy and team management.	3825530e-2646-4620-9de9-49dfb1df4f05	7378db3c-09c2-46f8-b28a-a8a1e86f8822	active	MEDIUM	2026-04-01	2026-05-29	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:05:57.185377+00	2026-05-08 06:05:57.185377+00	\N
06063b94-3b48-48bf-bccb-c8712a61000d	Research Work	PRJ-014	For internal research work	709e9c69-1184-40dc-a35d-e0b596b92219	4f980d85-4b3f-45d3-8163-4dad2e229146	active	MEDIUM	2026-05-01	2027-05-01	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:21:37.943348+00	2026-05-08 06:21:37.943348+00	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.role_permissions (id, role_id, permission_id) FROM stdin;
2b4f6c2b-6f54-4e31-8b32-6b000c7fef08	6ed99788-b067-4da9-be01-bb455a02f6bb	97da5d74-aec1-4a06-a9e0-77390a63a1f2
f38c6415-a218-44ac-959b-44dff42ed5f7	6ed99788-b067-4da9-be01-bb455a02f6bb	d21c2166-9724-4b00-a221-94a82bc6615f
67680dbf-6bb8-42bb-a439-fcbe98acd0bf	6ed99788-b067-4da9-be01-bb455a02f6bb	357870c2-b190-44c4-9a61-ea366ac2e33a
c836cf40-aa27-4fe3-9d99-830bedfd0873	6ed99788-b067-4da9-be01-bb455a02f6bb	5fda3e66-8ac2-40e5-b85c-3e4f73f5057a
dfeccd5a-2211-4ea8-94a7-2a74b3f4f204	6ed99788-b067-4da9-be01-bb455a02f6bb	d4e20023-8184-41d3-873e-76ff73c8532b
9a5ba406-e695-461f-b537-09102512b6e5	6ed99788-b067-4da9-be01-bb455a02f6bb	144cd0cc-4b05-464d-ae73-8b7650c55d56
cc9809cd-5b8a-41e6-8529-67fae5dbb812	6ed99788-b067-4da9-be01-bb455a02f6bb	1ce00c3f-3e80-4127-8583-da37e664ec2d
3a60e57e-b25c-47aa-b751-0d33a9002e71	6ed99788-b067-4da9-be01-bb455a02f6bb	e85518b9-db01-4cc0-8faf-66add3ab672d
dd7262ae-129c-4b02-82c8-33f55b5a761d	6ed99788-b067-4da9-be01-bb455a02f6bb	bbb61db9-014c-4be8-aad1-31f86e9ff7ab
cc071ee4-c604-451f-a4e3-78b1266e154d	6ed99788-b067-4da9-be01-bb455a02f6bb	5b164123-fc9a-4cdb-add3-473be7d82310
32d4a1dd-c478-447e-b3b4-1b20a6c2913b	6ed99788-b067-4da9-be01-bb455a02f6bb	430cbfd7-2bb3-49c5-b571-4a91576bd5ad
59392cf0-ef89-45bd-a4a0-869e0a1efc5b	6ed99788-b067-4da9-be01-bb455a02f6bb	d1d95d2f-fbf8-4bfc-80fc-8273c3bcc392
90bf21cd-57d4-495b-b31f-a2a89f2f951e	6ed99788-b067-4da9-be01-bb455a02f6bb	12a60d18-400d-4761-838d-4c73a096e778
0e758243-6cad-4a8c-8cd1-8bb312f4d8c4	6ed99788-b067-4da9-be01-bb455a02f6bb	8ca49db3-f4d8-4bcd-949c-f75d4093813e
e5582ae6-25b4-4a17-8dda-6194bf6137f9	6ed99788-b067-4da9-be01-bb455a02f6bb	8b0baff7-3ae2-4976-8417-9d1fb190a5ac
c47230bf-7fea-4a60-85bf-0d6473c9cac9	6ed99788-b067-4da9-be01-bb455a02f6bb	34ab2826-4210-423f-81f8-76a0a62a6727
c634fcf6-089f-4cd4-9d8f-7329495e5a2e	6ed99788-b067-4da9-be01-bb455a02f6bb	b35ddcf1-a2f8-4508-8765-b951fe9105fc
6d5ca588-3f54-4651-a1b3-ea1a53b06529	6ed99788-b067-4da9-be01-bb455a02f6bb	8e2408fb-352b-4cc0-b44c-95b224640d34
8a6d1d40-7767-405d-aab2-14ca9fc3ee5c	6ed99788-b067-4da9-be01-bb455a02f6bb	6846e36d-6f5d-47e6-8c72-1f7942f3033d
112240af-c342-4f7c-8087-dcaed1e2d9e3	6ed99788-b067-4da9-be01-bb455a02f6bb	d9357f88-40c4-46e5-afa4-ced49a7b8d3d
951f2ec8-4545-461f-bcfc-c7cf849026fd	6ed99788-b067-4da9-be01-bb455a02f6bb	da011b8a-ff07-40cd-b666-b07048067770
36543dd5-d607-4dd5-83dd-6df925328b72	6ed99788-b067-4da9-be01-bb455a02f6bb	ef582365-0473-4c92-96b6-c914bf9524f5
c0b9efff-ce6c-4c24-a4a9-47c7cb403ce3	6ed99788-b067-4da9-be01-bb455a02f6bb	0c630fe9-08ba-4c3f-a48a-349ae7cfddcb
78ad2a9c-c68b-41e1-b5fd-50cbe0616b08	6ed99788-b067-4da9-be01-bb455a02f6bb	80e9cd61-f948-4630-98f7-38a56b033538
14ed0f4d-348c-45e1-af2d-1e5fbdddc79b	6ed99788-b067-4da9-be01-bb455a02f6bb	53ec937c-4142-4cde-ad36-a36cfc78e938
aff05f0b-805d-44b5-9904-4b551f371cde	6ed99788-b067-4da9-be01-bb455a02f6bb	e0b307d2-8643-4448-9069-abca81357c7a
e7d187c1-5b0f-48fe-8624-78b82fe40521	6ed99788-b067-4da9-be01-bb455a02f6bb	cbe0b1d3-6101-412a-a1a1-533e5415f39c
6723a071-093a-49c0-af56-d80bfc9671d4	6ed99788-b067-4da9-be01-bb455a02f6bb	b30623ac-ff57-4605-a1f0-048599b7fd19
20f7abe9-d631-469d-977b-e8f7e9d4eb44	6ed99788-b067-4da9-be01-bb455a02f6bb	6717c5d6-0404-4760-985c-00d48cf0ef3d
ddbddc17-a9a8-42e0-8b3a-dfc80d9bf2ae	6ed99788-b067-4da9-be01-bb455a02f6bb	cf0f6d98-0924-4d55-87ca-23268e5f18cf
66959ef3-6bec-4316-b72f-3a6dd3e9995f	6ed99788-b067-4da9-be01-bb455a02f6bb	9b34dc8c-4918-48c0-98dc-f55ab2791fe5
07863563-3a99-421e-8cdc-3c8aeed47c6f	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	9b34dc8c-4918-48c0-98dc-f55ab2791fe5
e7dedbc6-47bf-45e8-be43-37441c3ebaba	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	53ec937c-4142-4cde-ad36-a36cfc78e938
b6718238-7e1d-4cec-ba8a-83f33bb6ffb7	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	5b164123-fc9a-4cdb-add3-473be7d82310
0b0f44d1-aa78-47c8-a5de-c1726f58ca2b	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	430cbfd7-2bb3-49c5-b571-4a91576bd5ad
aa50b4a0-e2ab-4246-a44c-4ac7fb8a8239	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	12a60d18-400d-4761-838d-4c73a096e778
c0984329-26b0-4582-83db-3e24cb64dcee	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	cbe0b1d3-6101-412a-a1a1-533e5415f39c
b8ad9298-7465-4d07-ba59-01437ecc3866	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	cf0f6d98-0924-4d55-87ca-23268e5f18cf
73d64810-baa8-4cf4-b522-321663636aae	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	6717c5d6-0404-4760-985c-00d48cf0ef3d
6f7d38c3-17c0-4a6d-ba0c-e7448a982983	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	8b0baff7-3ae2-4976-8417-9d1fb190a5ac
98f127d0-5341-4dec-b10e-9bfb31056e8e	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	b35ddcf1-a2f8-4508-8765-b951fe9105fc
cf8a72ef-0e55-41fc-af17-c8e63854bb83	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	8e2408fb-352b-4cc0-b44c-95b224640d34
5f345e4d-d143-4c0b-b2b7-3227b96d01e4	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	d9357f88-40c4-46e5-afa4-ced49a7b8d3d
e1750f3f-b253-445f-a003-3e6f575e3ad5	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	0c630fe9-08ba-4c3f-a48a-349ae7cfddcb
825bdc29-90dc-4b71-a4fb-53a37445d73d	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	79cdb1b8-7ddb-4869-815d-68d36a3882d9
d2d7cf3b-a70e-4351-9ca2-a89e5f968eee	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	4dec445a-ba3a-4f15-98c8-036ffeb6d459
b5e33f66-73f5-4312-b056-a08189e2e615	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	8907d014-bebe-406d-b818-b83754bd82fb
6e39efb5-6ca9-4d2b-a404-0cc74194b290	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	7c0224a5-551d-4bd6-ac70-7d0506dbca0d
8c565754-f0d8-4147-8a6a-194b82bb4eaf	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	0d2db4c8-accf-41af-97cc-83a3c0774a13
f90fd5cc-2e51-4ca8-b2e7-7c33a6f92b32	a1b7527a-c923-498f-89a9-5a7667dee311	5b164123-fc9a-4cdb-add3-473be7d82310
7e4d4c64-b6b7-474d-a899-ffc27d5b7632	a1b7527a-c923-498f-89a9-5a7667dee311	8b0baff7-3ae2-4976-8417-9d1fb190a5ac
b07258fa-fc3c-488f-b7f7-08b86328ea48	a1b7527a-c923-498f-89a9-5a7667dee311	b35ddcf1-a2f8-4508-8765-b951fe9105fc
8a3763ac-b6f5-4a24-a8ba-37ce8fdf615f	a1b7527a-c923-498f-89a9-5a7667dee311	d9357f88-40c4-46e5-afa4-ced49a7b8d3d
cd345453-8448-4ef7-9a21-2f9b20dc6873	a1b7527a-c923-498f-89a9-5a7667dee311	0c630fe9-08ba-4c3f-a48a-349ae7cfddcb
abf36df5-5a0c-42aa-ad72-7b6904348622	a1b7527a-c923-498f-89a9-5a7667dee311	8907d014-bebe-406d-b818-b83754bd82fb
2289b10b-3bfe-4dcc-ad65-87d5176d4b86	a1b7527a-c923-498f-89a9-5a7667dee311	7c0224a5-551d-4bd6-ac70-7d0506dbca0d
9aa5f5a6-0cf4-48e8-8087-23a5c6c1b7c4	a1b7527a-c923-498f-89a9-5a7667dee311	0d2db4c8-accf-41af-97cc-83a3c0774a13
3721aa5d-9a09-4eba-9f98-6adfb9fd570c	a1b7527a-c923-498f-89a9-5a7667dee311	79cdb1b8-7ddb-4869-815d-68d36a3882d9
ffc832fb-30c8-4af6-87c4-9356ca129434	a1b7527a-c923-498f-89a9-5a7667dee311	9b34dc8c-4918-48c0-98dc-f55ab2791fe5
64463aa4-7b67-4ea1-b625-6e2460d2b020	85f42bb4-e517-436c-a44f-3367a9bb35a2	5b164123-fc9a-4cdb-add3-473be7d82310
79853b72-7386-4194-8a99-b54780f746af	85f42bb4-e517-436c-a44f-3367a9bb35a2	8b0baff7-3ae2-4976-8417-9d1fb190a5ac
c89e3ae1-a3e9-4d7f-85cb-aeac9eb778d1	85f42bb4-e517-436c-a44f-3367a9bb35a2	b35ddcf1-a2f8-4508-8765-b951fe9105fc
fdebd9a8-0b23-46d8-bd1e-fcab2d925abb	85f42bb4-e517-436c-a44f-3367a9bb35a2	d9357f88-40c4-46e5-afa4-ced49a7b8d3d
15be96e7-fb48-4aa7-95c8-49793f7addef	85f42bb4-e517-436c-a44f-3367a9bb35a2	0c630fe9-08ba-4c3f-a48a-349ae7cfddcb
aea6a1f9-f265-4c4f-bd92-9e47da6622e4	85f42bb4-e517-436c-a44f-3367a9bb35a2	8907d014-bebe-406d-b818-b83754bd82fb
0b1a2fcc-66ae-4df9-934b-8329af092984	85f42bb4-e517-436c-a44f-3367a9bb35a2	7c0224a5-551d-4bd6-ac70-7d0506dbca0d
5ac92441-135b-4f75-b6b9-28bfc1c4a922	85f42bb4-e517-436c-a44f-3367a9bb35a2	0d2db4c8-accf-41af-97cc-83a3c0774a13
07950a38-67c3-4ed1-86b5-fc57ae456161	85f42bb4-e517-436c-a44f-3367a9bb35a2	79cdb1b8-7ddb-4869-815d-68d36a3882d9
8422d300-e7a4-4e9b-85c7-8ea9b2686642	85f42bb4-e517-436c-a44f-3367a9bb35a2	9b34dc8c-4918-48c0-98dc-f55ab2791fe5
c19949e4-c8e7-48e8-a725-7440dd124617	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	5b164123-fc9a-4cdb-add3-473be7d82310
989e0312-b978-473e-a024-da6684448a58	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	430cbfd7-2bb3-49c5-b571-4a91576bd5ad
fd6c9870-7bf9-4024-a5bb-44a55c5f530f	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	12a60d18-400d-4761-838d-4c73a096e778
fe8d33df-5f6c-427a-843d-b582d7d0da52	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	8b0baff7-3ae2-4976-8417-9d1fb190a5ac
c28aaf31-f8c0-48a4-9615-28d59aa6c0db	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	b35ddcf1-a2f8-4508-8765-b951fe9105fc
4b79be6c-4ba0-46a7-8a24-952ee71bef7a	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	8e2408fb-352b-4cc0-b44c-95b224640d34
361ff030-a425-437d-898e-39edc9a1a9c1	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	d9357f88-40c4-46e5-afa4-ced49a7b8d3d
8d5119bc-2217-4318-a77c-2649a12ebfb7	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	0c630fe9-08ba-4c3f-a48a-349ae7cfddcb
119ad908-bd20-4715-bf35-2d6d85061e30	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	8907d014-bebe-406d-b818-b83754bd82fb
bd33fe6e-e85d-4478-8f0c-cc0c7fd0667b	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	7c0224a5-551d-4bd6-ac70-7d0506dbca0d
a6186a0d-3c34-41bc-9bb2-d2d8db3e9fae	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	0d2db4c8-accf-41af-97cc-83a3c0774a13
67364cbc-27bf-4a0e-be0b-1bae9722436b	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	79cdb1b8-7ddb-4869-815d-68d36a3882d9
1d9849d6-23f8-480f-8e8c-b20a2fdc1322	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	4dec445a-ba3a-4f15-98c8-036ffeb6d459
c9b9813d-580f-40f4-9f6c-60137a2fb778	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	53ec937c-4142-4cde-ad36-a36cfc78e938
77573b42-0672-46f0-aa1d-900734298087	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	cbe0b1d3-6101-412a-a1a1-533e5415f39c
18950dd7-0daa-4c97-83ce-3fe4fa4805f2	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	6717c5d6-0404-4760-985c-00d48cf0ef3d
2d8a4d39-37ab-42ea-b785-be47eb53fc02	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	cf0f6d98-0924-4d55-87ca-23268e5f18cf
173b6fab-a99e-48ac-b0f2-f8ecfb9ddd15	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	9b34dc8c-4918-48c0-98dc-f55ab2791fe5
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.roles (id, name, description, created_at) FROM stdin;
6ed99788-b067-4da9-be01-bb455a02f6bb	system-admin	Full system access	2026-04-28 05:00:54.830174+00
3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	project manager	Manage projects, tasks, and team delivery	2026-04-28 05:00:54.847361+00
a1b7527a-c923-498f-89a9-5a7667dee311	developer	Execute assigned work and log time	2026-04-28 05:00:54.869434+00
85f42bb4-e517-436c-a44f-3367a9bb35a2	Business Analyst	Execute assigned work and log time	2026-04-28 06:23:23.049119+00
f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	team lead	Lead team execution and coordination	2026-04-28 05:00:54.858698+00
\.


--
-- Data for Name: task_assignment_events; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.task_assignment_events (id, task_id, from_user_id, to_user_id, changed_by_user_id, changed_at) FROM stdin;
c2158e1d-7576-4755-be54-5bada3501311	fd5da34a-6252-4d3b-bd7b-819b3b715253	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-28 05:13:46.661973+00
437b8784-0877-441f-bbc8-f77a10a30dc2	f8d7a603-d051-48f1-a612-a6eda5e94011	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:48:36.129317+00
ddc7e294-dcc6-4402-b231-b85a34f5d4ee	3fc9637c-cc52-4f35-98fb-4e7f7eac3514	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:49:24.761298+00
180fae44-9e2f-4d01-a0bb-e943a78a2bcb	3fc9637c-cc52-4f35-98fb-4e7f7eac3514	4f980d85-4b3f-45d3-8163-4dad2e229146	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 05:50:15.914714+00
7131e015-f06e-434a-bb31-de9748828488	63caffdc-0891-4344-a27a-c7a250c882e0	\N	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 07:09:23.088547+00
e0e250d9-d087-4d65-be3d-8b3921fb5c15	c2f8aad0-bc56-4d72-b2ee-7411ceec69a7	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 07:10:21.219436+00
ed352c55-7dd0-4479-9271-bee0203fd6f7	df7b37bb-067f-4956-a341-55503420489b	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 07:12:52.110774+00
0a48e5a9-4c80-4a85-85b2-4490d0d5eacc	8a92358b-27db-4ece-a390-852844ddd7a5	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28 07:13:18.513993+00
5fa75243-722c-427d-8686-deb158387850	5c3c9814-fcd4-4dd7-a935-b1665cc63bf9	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-28 07:19:53.465475+00
4c2d348d-7ff6-457c-a8e8-20659000b6b3	63caffdc-0891-4344-a27a-c7a250c882e0	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-30 04:43:42.964423+00
378eeaf6-c28d-4b0a-abec-57de2b12a79a	83fde455-098b-4e56-9705-f43e7a16fb5c	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-30 04:56:46.957725+00
57df78ca-aa13-4b04-a2e1-ca6cd52ba90f	e43f6b37-81bc-4c4e-9fdd-626cfddb6c41	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-30 04:58:13.170224+00
b7287b7e-92df-4ffd-9cbc-48c3f0140ebb	c2e6f535-31cf-44d3-a339-a0e16f4d19cd	\N	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-30 05:00:18.423575+00
f5f669e5-676c-4db3-9d76-a85caf59bae5	7bcdb40b-7404-4d21-8328-c464744d96b1	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:26:19.774767+00
90fbdd61-62b3-4f4e-a7a8-41c40df21e3d	08f20dd1-de0a-4f1c-8567-5af391092c5f	\N	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:28:11.669053+00
4c5c6ae8-bb86-4817-8169-fbc7493210d5	4afe1926-8e08-4dae-a823-fc0dbb6a6a31	\N	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:29:30.413936+00
ff0a81ef-92a6-4052-8235-f8fa039a98ac	49b1424e-311d-41bd-8fce-22618ef1e6bb	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:31:23.569221+00
c71fc2a2-58dc-4201-ab06-c8a51c799980	73addaac-60b9-4a37-b766-bd1c75107491	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01 06:41:01.497411+00
67622190-4aee-4b7e-822f-02fc5f4b8a7d	b0c80d5d-5ca7-46e6-88e8-536985b3e22a	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-05 07:29:04.234516+00
486a8f73-38d9-413c-9fb3-dfad69fb4693	3d90ff12-0032-40fb-b364-767d814eb863	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-05 07:33:54.777811+00
bf55dabd-a137-4e98-b7e4-12db2e68d18f	dcaec9db-84ca-49b2-8eea-e57bd88e9c61	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-05 07:39:30.089775+00
a81d1b04-a92f-45ef-b8ee-2ab24b2aaead	3dc6e63c-646e-4cba-9ab6-0171e48404ac	\N	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	2026-05-05 08:30:36.461916+00
b8b420b8-cd9b-4d6f-b9d7-a8b46307166a	5ee26848-89dd-4f49-8894-1fc8107e0928	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-05 08:35:50.053273+00
7ecee446-9707-4e24-bc77-dc2e4fd86629	592933a6-563b-4ad6-95df-e3e2b9283842	\N	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-05 10:25:52.290805+00
ad6c3a07-14f4-4f7b-90bc-ad7038acbe5e	28a8557e-6afa-4fd3-b2a3-ac1cfc034562	\N	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-05 10:28:51.270417+00
32487abd-4d9d-4bea-9e59-c3e6e9e9df43	6fcd22d5-69f7-4152-ba19-d63afddd4167	\N	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-05 10:30:07.293344+00
4910ed14-c390-4017-941a-9dad00db3360	a2880245-3c30-4afb-8560-9cd63856560b	\N	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-05 10:31:32.579527+00
6ba24bf9-ffb4-47ff-ad15-6d60d3449739	0f73bef5-93d9-4404-bbac-8d55f47e86ae	\N	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-05 10:33:50.146093+00
58b50447-5d2c-497f-b67c-3af12fa44894	e6efd600-ccc6-47cd-988d-737833c50005	\N	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-05 10:35:04.859726+00
f45ad74d-9f4a-471c-9cb6-dba613b3a275	360e729a-9153-49a7-9bc2-faaef113d100	\N	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-05 10:36:32.075974+00
178b2ced-304d-49e3-aadf-dacd2c4ee133	3baf768a-4c5f-4371-b495-091151a1f7ef	\N	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-05 10:37:05.730052+00
329635ec-53a6-4fb7-8353-c62a24fcee99	d3a51bd8-420c-413d-a36a-7750b4e6e5fd	\N	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-05 10:37:24.03936+00
81072030-26f8-407d-87d9-157525be0b84	410fe3a7-cdf0-4810-8a47-ac3a433b751d	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-05 16:52:35.822414+00
89456e5c-9f7b-4fb4-ba08-d174e95f1700	b458d091-f451-49a1-b328-fffab206ddfe	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-06 05:15:40.783698+00
5f002166-df11-4e10-b905-5455f283be39	8883ef64-242d-4c2d-a74d-57f0e286d8db	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:05:41.225855+00
28baaf45-1985-4549-84a0-afd1de0c60f0	d544095e-61e0-4af6-ad6c-60f1e6e5307d	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:08:05.972781+00
d1c6f1c3-263b-446f-8cf1-fe27047e0ec2	70a109db-7a68-496a-bc02-e1bafcc4ca08	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:09:30.098773+00
3af6cfa1-74e1-417b-be95-bb6bfb59005c	26c8682c-8978-4ee7-bdca-4360503c8028	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:10:10.647998+00
2005d179-e7b7-4d54-b8e9-16985b819c60	5077042a-8d28-49aa-9a2f-aca1f5ee4a1f	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:11:15.408265+00
645a585c-c2a3-469c-bff2-fdf4d5b919ff	501bd978-811c-42e9-8f5c-e60674031a55	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:11:51.571575+00
f6598b64-c27f-414b-bacf-51f92ad61115	aac29a5d-6827-446a-a639-a2615e4eefea	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:12:36.438139+00
f99f57f1-7168-485a-b8b0-974e43135ba9	26f136f1-bf11-4279-93fa-36aa30df2a7a	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:14:44.415477+00
288ad3a3-388e-4050-a2a0-50e08eabc20c	48a61717-1a2b-4eb6-8aca-0825d8d0a171	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06 06:15:58.274698+00
76444630-ab9e-4b91-89ea-5238eaa7a0d8	70db8a6e-05e1-424e-9347-dbfa3fd0be39	\N	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-06 06:24:59.490765+00
1fd892bd-c5aa-409e-8ca3-fc49b1683842	474acd5b-f6dc-4612-92d1-7ddbebb42139	\N	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-06 06:28:17.097857+00
7a90ba1f-ff73-4da3-a55c-06dc4362f99d	b15cf0f9-9010-4226-8120-0cad7d355d9c	\N	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-06 06:34:21.765666+00
907178f0-f5d5-4e9c-9971-588f4912c77d	9cf45e8d-5384-4adc-b2eb-e75fc203c0a9	\N	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-06 06:36:28.488002+00
fb9c4a50-4e96-4463-9cce-078ab19695bb	2aaa79e1-9595-45a8-b9e8-f9e9fe9c483d	\N	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-06 07:01:12.924837+00
2a947d2e-b54a-44b2-b27b-ca2cfd4ec3b1	5af5df3d-b8bc-465e-ba2b-7590bcf905a5	\N	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-06 07:04:44.088597+00
e1481af3-791b-4a85-8956-d18cda2f23ea	b830f3ab-6d0e-4111-a9a2-e2739127bfba	\N	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-06 07:07:20.964543+00
9225b662-f5ed-40b9-9739-e576950b1d54	18ed5e34-5271-4f50-b35c-221f04e8cb3f	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-06 08:11:26.542713+00
0a602dba-c14f-427c-ac2c-4ed56abd3df5	8bd88e59-992d-470f-ae76-59b0276911f8	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-06 08:12:41.976045+00
6f7f9adb-5a37-476c-b7ad-da4e1315b6e4	57179b52-99a7-45c3-a756-8fcbbb405199	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-06 08:13:46.687516+00
d7805976-0c4e-41cb-9911-83fca317f280	65196aff-e27a-4a57-a704-a429f732038a	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-06 08:20:37.829177+00
a060a7de-e69f-4793-8c4a-261d70b9a9dd	c175e2ff-5618-47c6-b98a-93c36a27e7fb	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-06 17:05:14.736559+00
85cb1c44-a5bb-48f5-a99c-0e8d3d68a865	b18fe47a-eb94-419d-8238-1ac287fdfb1b	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-06 17:08:38.546011+00
70781f9a-15a2-4775-835b-9018a9ff80bc	9c572c5d-1db4-4811-8454-d1b9c6596bd2	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-06 17:09:44.651813+00
877c961b-b877-4c8f-be67-275dbc440fc5	6c318817-dfd8-4ecc-915b-2f7170dd27e9	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-06 17:09:53.592862+00
3455ebaf-541d-4e99-ac68-8c0c16749c33	276633b0-ec28-406a-9c7a-6f96b6654f7b	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-07 03:30:15.460578+00
0ce7aaac-92a4-47c7-ba35-eb55f1969543	5d9a2907-fb12-4f67-8053-3382187273da	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-07 04:25:47.132556+00
4cf26f49-b3b7-4d0e-82ee-4f4b90831675	a807ba0a-cd20-4141-a9c0-d866c2e7dd33	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-07 04:29:10.962671+00
f3cf510f-244a-4eb4-bc4c-2c652ef1570c	6f125570-c26f-45bf-9512-0f0ae2761b3e	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-07 04:44:25.338008+00
be4e97ac-6bb8-4927-a255-d20049c06c0c	23496619-2364-4b38-bd61-b1bdc85a3e1b	\N	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-07 06:04:52.882511+00
7930c383-8faa-473f-82db-603e08e22bfd	40a7951f-d6e7-4788-bae8-ea13b76f59f2	\N	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-07 06:06:20.568027+00
b5ce4877-ddb1-4cee-99d3-790f1f9891e8	fe53ca2c-dbd2-4f6c-972a-426da701c092	\N	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:11:51.478167+00
1dd86007-2fb9-4547-bec8-01810c5cc18e	2c019fb9-1575-4d45-a0fb-ca512de532ae	\N	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:12:29.388005+00
11dee902-4e18-4cca-8a23-66b3894adb42	6e501eae-69dd-428e-b3d9-a8627a508c20	\N	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:12:52.879264+00
4c6a8ed3-7bc8-49dd-8231-9d3521ed3f0e	36af1766-c046-4c43-9917-e989820a37f2	\N	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:13:13.192403+00
9632143d-ef85-4ae1-8985-9d0a5e160a2f	fe53ca2c-dbd2-4f6c-972a-426da701c092	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:16:16.227264+00
1c776a5b-f74b-4045-afcc-dcba1601b093	2c019fb9-1575-4d45-a0fb-ca512de532ae	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:16:28.593434+00
7975c5d5-37d2-4daf-a7b0-98477ddcd172	6e501eae-69dd-428e-b3d9-a8627a508c20	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:16:36.610209+00
6a7f72df-187a-491c-8585-e81ed8a107d2	36af1766-c046-4c43-9917-e989820a37f2	\N	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-07 06:16:44.105596+00
7561992c-0481-41c9-a657-bf725f7440e8	3d73883d-2cc6-4643-959f-933bd91f458c	\N	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-07 07:24:17.687889+00
a60709f4-e26e-42d4-afcf-aa16cd9a9f29	c76c048e-e351-4a1d-9f0a-9a7ec57980ba	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-07 13:58:51.416207+00
2978a1e5-4714-45e2-bee6-e1b9c64bdb4d	c62ad4cd-8d31-4eb0-a72b-50fbd9389153	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-07 14:00:07.615128+00
39faeaa3-c777-418b-a463-34619d699d5d	9236924c-64ae-4fa5-a693-c14745029dc1	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-07 14:01:21.073665+00
fe7ad861-d5b3-4821-8941-8aa098586945	0ff727d9-3f7d-40e1-9b02-7de025fb5f4d	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-08 03:35:08.44192+00
9544ff6c-d89c-40bd-bcdf-566d831d5a31	ff452613-711e-4968-ba05-cfb16055a67e	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-08 03:36:19.070121+00
6e0d68a7-5816-478a-99b8-be4674575c90	00fab321-ae6a-4020-862c-b047370661cd	\N	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-08 04:27:02.551772+00
bacc324f-5741-4829-8af7-56dafdfc99a9	8188d511-ba1e-4be8-a1c0-e33b2c2e0ec8	\N	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-08 04:28:08.805339+00
9861bd09-fc60-4054-ae0a-cb6ebd644386	6e539a34-da7b-40b7-8deb-367efa66be42	\N	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-08 04:28:21.282425+00
60257516-b5ad-436d-8049-74b20b08466d	e919b479-2516-4092-a541-207f901d658f	\N	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-08 04:28:33.586471+00
ff7422a9-be60-4f12-be88-7df54b6dfc99	ca260cd5-4904-4e9d-99d0-3c9b0d2ab684	\N	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-08 04:44:21.372099+00
38d9035a-df40-48cf-8c21-15ae57b5f52c	ddaa86a7-c41f-4cd5-bdf0-21de2972a376	\N	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	2026-05-08 05:48:21.156305+00
0c1a1ad0-be85-48a8-821f-d714a7c4a9f2	5cd0f9a9-23e2-4fe2-90e2-366ef38e093f	\N	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 05:59:48.714618+00
890fb294-31d5-4fbb-b2d6-7415960c2ef4	259755a2-0984-4917-980a-45eee8fd2149	\N	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:10:04.549495+00
d6194490-2208-4437-8bc6-d6f0a711b4db	9781a58f-78f2-4139-a652-5266694ca193	\N	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:17:52.267067+00
45a95c88-4a4f-4fbe-981b-26d24c49caca	111fe9e6-6b87-4df3-aacb-9f6024673f56	\N	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-08 06:22:43.912944+00
fe7e8aa0-d874-4527-a733-222451515ccf	8bd02729-ac74-4925-8b67-b8962e2ab886	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:36:06.841631+00
01b1f0a4-53ef-4f63-b082-d74fc9c8e87d	eaf9dfae-e9d2-46f6-928f-1518a5debd89	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:36:50.103758+00
0fd9836f-340e-4a24-ab72-457c476a48ed	c04b54e9-d205-4ae9-bb00-c5a9b3954471	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:38:21.287781+00
bbd0e391-55ed-43dd-b13d-b84524e686aa	88acb876-3ab1-436e-973e-a77145ab0809	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:39:22.015515+00
a6e6f41e-ac15-4280-a74f-5132d5c25504	001056fb-d1a3-4443-aedf-18b404f5041e	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:40:29.3088+00
be33211e-f4e5-4221-b7d3-6ab3b73d1a22	b5d1414c-bb63-43c6-972e-de8b3edc9fd6	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:41:44.8338+00
05b8d4f4-0944-4d04-9bbf-0b32c665b2ea	51a2edc9-3c06-4c53-b038-8cdfdde082a8	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-08 08:43:03.904239+00
9b3c520f-a471-4919-af0a-71819dc403cb	c376cf9f-3a9f-43d4-80b1-b70541faacb3	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-11 06:38:15.746081+00
1a3c55bb-ea46-45cf-8c52-2c68fe901798	66ea443a-bf00-41ca-af08-98cffa13b25d	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-11 06:39:10.549172+00
b118aa91-b775-49ca-8a29-c8907dac6e49	5929261c-a1ac-4980-9133-79e342ddbff2	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-11 06:39:39.102344+00
f3300dee-3ee7-4535-83a4-99d07835bc5a	5da5f525-a708-41fa-b859-5c62df491958	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-11 06:40:41.734758+00
61d0246d-edf5-4fb7-a3f7-515f2d5b7b19	f985e6e2-eed1-4d2f-8797-03260e487b61	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-11 06:41:38.028282+00
99204c7d-cfd7-4080-aa82-cc0cd17c9f90	e0d84385-755f-4621-a10d-73d68340ef78	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-11 06:42:58.73284+00
abf838ae-ffb8-4706-929f-7f6ad890c679	f4cfb475-898b-4ea6-9a05-aad9d49bfcac	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-11 11:25:27.638418+00
fbf4a1a5-1e81-4f50-84b0-5f9274f078c1	80a7e8e4-29f2-407c-bc86-663414c5d82c	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-11 11:26:05.456618+00
5c0d3c2a-8e04-457e-98d6-5fadd1fb2996	b3c324ac-f1ea-4b77-a59d-dd988d01d283	\N	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	2026-05-12 07:39:36.312409+00
f5fb2221-e3ab-4de1-b9da-9dc0fd348cc9	13692cf2-1529-4952-91ce-29e9681111eb	\N	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	2026-05-12 07:39:56.375067+00
ac13d9c7-37be-4445-8cf6-71a0fc8a5776	4961b9fa-45fa-44db-93d9-d5d8ed9f118c	\N	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	2026-05-12 07:40:10.5964+00
c2a2681d-b8d7-49cb-9bcf-3ca36f74cba0	a2ebb328-d477-47a9-929b-126256ce4972	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12 10:11:26.701656+00
5a91a8b9-4e8a-46ba-9502-1da98a5d8821	996b78e5-7c53-4fb4-99b3-70f29d990c88	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12 10:12:55.394639+00
0f56bc32-a584-462c-ac14-1f7719333d92	fa0f2116-f111-4373-8129-b8ef77ef18bf	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12 10:13:14.394413+00
8d3254a7-f737-42bc-8e9a-5a01b20d77c5	55e898c9-49cc-40f6-9c8f-0819a0a52cb0	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12 10:13:26.75377+00
55ff7dcc-9155-4b2f-b762-1cbe5de13670	1964a002-17a0-42ff-a14c-d215381a64b4	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12 10:15:36.463489+00
b18b3376-7eb3-4a4a-bc2f-e745842cc222	8d3a395a-09e1-4b7d-8665-a26395694d93	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12 10:16:52.822063+00
211fadcd-e6d6-4fa2-8e74-9b8d363303fa	6e622220-09de-472b-9d63-a5af288b1c00	\N	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-13 04:15:21.846947+00
f807dcd9-34c4-449c-a651-7f9a9cded0ce	1495d953-30c9-40b0-a44a-5c30bebfacb9	\N	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-13 04:45:44.047943+00
471566c9-fdf1-4749-9569-d57248b6d1b5	4aebbcd3-4f63-47ca-aef0-2dc1c7ef856e	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-14 06:15:46.432229+00
ecaa17c3-de0d-43f7-bc13-0994d6967007	6a78ec1a-9004-4015-a38a-1e4d3262120b	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-14 06:16:22.912084+00
a7ac4a16-4a78-452c-bacf-b99324dde3ed	14f80f6d-b39d-4e90-8dec-0e301f4ff9a4	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-14 06:18:25.267331+00
dfab8e45-e350-47ed-9baf-a99768c19030	cc6372f8-dcbd-4924-b570-e42bc9aff277	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-14 06:19:52.242414+00
13ba1994-3d1e-4e39-b44e-0752459e694f	2da24d8c-6751-4ec9-9282-76e7dd1743f2	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-14 14:04:08.646021+00
c5a37c47-2ed7-4687-a0a2-cdbc4d75ebf6	3bfa0da4-e3be-4700-be83-a4bc91a02857	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-14 14:05:19.821537+00
6f0fe79e-6677-4daa-9fcb-c56c4e5e6a1a	cc2a9f02-66b2-4f06-b67c-940c62623844	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-14 14:06:02.508592+00
534a64d6-5de3-45d6-be8b-2f7d6d3c0b4a	15afd71e-cbc5-4254-91be-6a38893a18cb	\N	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-14 14:06:26.558535+00
88213ba1-ca2b-40fa-9676-856e95f884e3	7efb2fe4-b92e-4761-a626-49688fbffbce	\N	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-15 04:05:58.986949+00
9df8f949-8de0-4a78-bce6-7fbc18bfa96d	7bc24e9e-15db-464e-a641-620d11eb415d	\N	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-15 04:06:44.435153+00
19631883-e092-472a-a361-2c821a7649e7	b7f863ba-60b6-4350-880e-ff240ea650ee	\N	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-15 04:07:58.238788+00
1f51fde8-50e2-454f-afd4-51025ccb88ba	79ef2691-703a-4ca0-be76-f644b3ff1472	\N	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-15 04:12:06.766843+00
e8e7b862-d0c6-4b15-83cf-4bbab367e45f	5a5914ce-2be5-4953-aa13-83b54e50c367	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15 16:57:14.016858+00
7e4f01ee-cf19-4dfa-96bf-b5387f68e90b	0f30af72-2697-45ec-bd06-c4ac01fbb781	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15 16:58:14.559225+00
338e9e67-d06a-4d69-adb4-79c3c0e69abc	e07426ec-50c5-4700-8c1e-ccee1d88e85c	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15 16:59:32.831341+00
3322ccb4-5768-4e70-8124-269517aea61c	f5bcc6d9-7c53-41c6-8bf2-20a7d78e7e3e	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15 17:00:28.537462+00
db846ab6-1691-496c-8cf3-c3ad83e90c91	bbcbf38f-6dc7-4dd6-805f-6800acf59d55	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15 17:02:06.621602+00
aac3e5a2-2a49-4b36-805c-14ef3d2a3073	c819d571-1ef8-4bbd-bad9-a6b7c42c5926	\N	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15 17:05:21.709154+00
d66d1412-650f-4755-828c-d8943299ee72	df244a07-ff34-4f82-bf3a-eefc776cd56b	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-18 04:56:08.855628+00
f5eac40e-e3f0-49f9-b348-c136d0f73102	85ab3e63-091e-4761-937e-14d7a45a62ba	\N	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-18 04:59:09.503631+00
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.tasks (id, name, description, project_id, assigned_to, assigned_by, status, priority, created_at, updated_at, deleted_at) FROM stdin;
7bcdb40b-7404-4d21-8328-c464744d96b1	XML error fix	Need to apply Cloudfront route and secure the marketing media including cache at edge location.	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	COMPLETED	HIGH	2026-05-01 06:26:19.76955+00	2026-05-07 04:38:34.707+00	\N
49b1424e-311d-41bd-8fce-22618ef1e6bb	Fixing media upload and view	Fixing media upload and view after cloudfront protected url changes	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	COMPLETED	HIGH	2026-05-01 06:31:23.564+00	2026-05-07 04:42:13.217+00	\N
6f125570-c26f-45bf-9512-0f0ae2761b3e	Deployment of the Elastic Container Services	Deployment of the Elastic Container Services for frontend and backend, then need to check the status and logs of the healthy services indication or execute rollback plan	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	IN_PROGRESS	HIGH	2026-05-07 04:44:25.332172+00	2026-05-07 04:44:25.332172+00	\N
fd5da34a-6252-4d3b-bd7b-819b3b715253	Test	kjhkj	70f5be23-a5e3-4b1b-acd3-40a5ff06b9d4	4f980d85-4b3f-45d3-8163-4dad2e229146	4f980d85-4b3f-45d3-8163-4dad2e229146	IN_PROGRESS	HIGH	2026-04-28 05:13:46.657008+00	2026-04-28 05:22:23.335+00	\N
3dc6e63c-646e-4cba-9ab6-0171e48404ac	schema design for vespa db	\N	c107877f-589a-4710-bb69-de69bc8921ca	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	COMPLETED	MEDIUM	2026-05-05 08:30:36.458923+00	2026-05-08 05:47:46.564+00	\N
f8d7a603-d051-48f1-a612-a6eda5e94011	Process Documents	Creating Process Documents	e52617ba-6e0c-44b9-b91a-a90c4188571b	4f980d85-4b3f-45d3-8163-4dad2e229146	8542caa8-697c-4064-a45b-fc8fd3ae2732	COMPLETED	HIGH	2026-04-28 05:48:36.125432+00	2026-04-28 05:51:57.075+00	\N
c2f8aad0-bc56-4d72-b2ee-7411ceec69a7	Task-3	Task-3	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	IN_PROGRESS	HIGH	2026-04-28 07:10:21.216962+00	2026-04-28 07:11:45.89+00	\N
df7b37bb-067f-4956-a341-55503420489b	Call With Uday	Call With Uday-Done	e52617ba-6e0c-44b9-b91a-a90c4188571b	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	IN_PROGRESS	HIGH	2026-04-28 07:12:52.108364+00	2026-04-28 07:12:56.502+00	\N
8a92358b-27db-4ece-a390-852844ddd7a5	Meeting With Prabhjot	Meeting With Prabhjot	e52617ba-6e0c-44b9-b91a-a90c4188571b	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	IN_PROGRESS	LOW	2026-04-28 07:13:18.511373+00	2026-04-28 07:13:57.247+00	\N
5c3c9814-fcd4-4dd7-a935-b1665cc63bf9	Test-prabhjot	Test	e52617ba-6e0c-44b9-b91a-a90c4188571b	4f980d85-4b3f-45d3-8163-4dad2e229146	4f980d85-4b3f-45d3-8163-4dad2e229146	IN_PROGRESS	MEDIUM	2026-04-28 07:19:53.461594+00	2026-04-28 07:19:57.422+00	\N
3fc9637c-cc52-4f35-98fb-4e7f7eac3514	Record the Sessions	Transcripts Generates Successfully	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	IN_PROGRESS	HIGH	2026-04-28 05:49:24.757542+00	2026-04-30 04:43:15.014+00	\N
63caffdc-0891-4344-a27a-c7a250c882e0	Tasj Second -2	Adding New Task	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	TODO	MEDIUM	2026-04-28 07:09:23.085861+00	2026-04-30 04:43:42.96+00	\N
83fde455-098b-4e56-9705-f43e7a16fb5c	Google Knowledge Base	To Create the Google Knowledge Base	e52617ba-6e0c-44b9-b91a-a90c4188571b	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	IN_PROGRESS	HIGH	2026-04-30 04:56:46.9541+00	2026-04-30 04:57:04.743+00	\N
e43f6b37-81bc-4c4e-9fdd-626cfddb6c41	Record session and Transcript falling on production	Daily Task	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	IN_PROGRESS	MEDIUM	2026-04-30 04:58:13.164568+00	2026-04-30 04:58:28.295+00	\N
c2e6f535-31cf-44d3-a339-a0e16f4d19cd	Advilex	Review the Client Requirement	e52617ba-6e0c-44b9-b91a-a90c4188571b	8542caa8-697c-4064-a45b-fc8fd3ae2732	8542caa8-697c-4064-a45b-fc8fd3ae2732	TODO	HIGH	2026-04-30 05:00:18.418321+00	2026-04-30 05:00:18.418321+00	\N
08f20dd1-de0a-4f1c-8567-5af391092c5f	Upgrade feature development on the Window and Mac	need to work on the upgrade option on the installer for mac and windows	da2d585f-0d82-4023-b47c-e2e410bfea8a	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	MEDIUM	2026-05-01 06:28:11.666033+00	2026-05-01 06:28:11.666033+00	\N
4afe1926-8e08-4dae-a823-fc0dbb6a6a31	Fix Mac upgrade feature	Need to fix mac installer upgrade feature, it is not working as working in the windows, not able to change ecwprod	da2d585f-0d82-4023-b47c-e2e410bfea8a	394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	HIGH	2026-05-01 06:29:30.409838+00	2026-05-01 06:29:30.409838+00	\N
b0c80d5d-5ca7-46e6-88e8-536985b3e22a	HPD Report	Worked on section 1 logical section for hpd report and\nresolved PR comments and merged the code.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-05 07:29:04.229159+00	2026-05-05 09:29:32.824+00	\N
3d90ff12-0032-40fb-b364-767d814eb863	HPD Report	Test the HPD report on staging and update HPD report UI according to the reference design.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-05 07:33:54.773723+00	2026-05-05 09:29:44.511+00	\N
6fcd22d5-69f7-4152-ba19-d63afddd4167	Review all notifications [Transport Team]	Please check all the notifications and errors, which appears on the UI or API’s upper layer, which can confuse user, do not carry sufficient information or have grammatical and semantic errors. Fix it using LLMs.	ef04818d-604c-43e3-939a-34c1ef5661c5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	COMPLETED	MEDIUM	2026-05-05 10:30:07.289032+00	2026-05-05 10:30:07.41+00	\N
592933a6-563b-4ad6-95df-e3e2b9283842	BEE-14062 & Sprint ticket investigation	BEE-14062 & Sprint ticket investigation	ef04818d-604c-43e3-939a-34c1ef5661c5	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	COMPLETED	MEDIUM	2026-05-05 10:25:52.286307+00	2026-05-05 10:31:19.217+00	\N
28a8557e-6afa-4fd3-b2a3-ac1cfc034562	BEE-13999	BEE-13999 : AutoComplete Improvement	ef04818d-604c-43e3-939a-34c1ef5661c5	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	COMPLETED	MEDIUM	2026-05-05 10:28:51.264753+00	2026-05-05 10:31:36.052+00	\N
0f73bef5-93d9-4404-bbac-8d55f47e86ae	Section A2_deactiavting the inputs when section A1 is not filled	We have a logic that until user has not filled section A1, entire section A2 must not be active. Currently some inputs in A2 respect this logic except UN, PSN, manual entry toggle and SDS search button.\n\nScreenshot 2026-05-01 at 2.38.39 pm.png\nTodo1: Please make UN and PSN inputs inactive. \n\nTodo2: Please make the SDS search button and manual entry toggle inactive.	ef04818d-604c-43e3-939a-34c1ef5661c5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	COMPLETED	MEDIUM	2026-05-05 10:33:50.141242+00	2026-05-05 10:33:50.274+00	\N
e6efd600-ccc6-47cd-988d-737833c50005	4PL. The item changes position in the grid when overpacked	If an item is overpacked, its position changes to a random spot among the other overpacked UNs.\nThis could cause confusion for users when working with lots of items.\n\nimage-20260128-064716.png\nimage-20260128-064725.png\nToDo:\n\nThe grid items should be in sequential order and new items appears top on the list. This will be same for both Overpack and non-overpack.	ef04818d-604c-43e3-939a-34c1ef5661c5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	COMPLETED	MEDIUM	2026-05-05 10:35:04.853741+00	2026-05-05 10:35:04.968+00	\N
360e729a-9153-49a7-9bc2-faaef113d100	BEE-14071	Incorrect hazard risc rating for 100% water	ef04818d-604c-43e3-939a-34c1ef5661c5	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	IN_PROGRESS	MEDIUM	2026-05-05 10:36:32.072084+00	2026-05-05 10:36:32.072084+00	\N
d3a51bd8-420c-413d-a36a-7750b4e6e5fd	A2 section_the packaging format empty	Using SDS search to add CW 1999-037, returns No data for packaging format, please check	ef04818d-604c-43e3-939a-34c1ef5661c5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	IN_PROGRESS	MEDIUM	2026-05-05 10:37:24.036541+00	2026-05-05 10:37:24.036541+00	\N
a2880245-3c30-4afb-8560-9cd63856560b	4PL. The 'Interm. Pkg' fields value doesnt change	When the ‘Inner Pkg’ fields selected value is not ‘Metal’ and the ‘Outer Pkg Type’ fields selected value is not a ‘box’, \nthe ‘Interm. Pkg’ fields value is ‘Not Necessary’\n\nExpected result:\nThe ‘Interm. Pkg’ fields value should be 'Necessary (Unregulated)'.	ef04818d-604c-43e3-939a-34c1ef5661c5	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	COMPLETED	MEDIUM	2026-05-05 10:31:32.575936+00	2026-05-05 10:38:27.244+00	\N
5ee26848-89dd-4f49-8894-1fc8107e0928	Test data for the Transport 180 and complete automation of the scenario	Analyze the master data and instruction sheets and based on the UN number , Pkg Type, Pkg Mat evalualte the validations and check the entry in the application	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-05 08:35:50.050368+00	2026-05-05 16:50:38.767+00	\N
dcaec9db-84ca-49b2-8eea-e57bd88e9c61	HPD Report	Test HPD report on staging and also looking into the EPD report.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-05 07:39:30.085646+00	2026-05-06 05:19:09.439+00	\N
d544095e-61e0-4af6-ad6c-60f1e6e5307d	IAM Access Key Rotation	IAM Access Key Rotation	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	MEDIUM	2026-05-06 06:08:05.966248+00	2026-05-06 06:08:05.966248+00	\N
8883ef64-242d-4c2d-a74d-57f0e286d8db	Need to create checklist for the Support team	Need to create checklist for the Support team	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	IN_PROGRESS	LOW	2026-05-06 06:05:41.222877+00	2026-05-07 04:33:51.757+00	\N
73addaac-60b9-4a37-b766-bd1c75107491	Need to invalidate cache after marketing media upload	Need to invalidate cache after marketing media upload, because after uploading new media old media is being served from cache.	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	IN_PROGRESS	MEDIUM	2026-05-01 06:41:01.492956+00	2026-05-07 04:34:21.103+00	\N
70a109db-7a68-496a-bc02-e1bafcc4ca08	Enable Cloudtrail audit	AWS Cloud Trail Management Events Logging	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	HIGH	2026-05-06 06:09:30.095434+00	2026-05-06 06:09:30.095434+00	\N
23496619-2364-4b38-bd61-b1bdc85a3e1b	Process top lines as informational rows from read in files	Excel template processing	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	IN_PROGRESS	HIGH	2026-05-07 06:04:52.876629+00	2026-05-07 06:04:52.876629+00	\N
5077042a-8d28-49aa-9a2f-aca1f5ee4a1f	Application Load Balancer Target Group encryption	Application Load Balancer Target Group encryption	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	MEDIUM	2026-05-06 06:11:15.404521+00	2026-05-06 06:11:15.404521+00	\N
501bd978-811c-42e9-8f5c-e60674031a55	Cloudfront SSL certification on the Origin Server	Cloudfront SSL certification on the Origin Server	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	MEDIUM	2026-05-06 06:11:51.568003+00	2026-05-06 06:11:51.568003+00	\N
aac29a5d-6827-446a-a639-a2615e4eefea	Amazon EFS Client Not Using data in transit encryption	Amazon EFS Client Not Using data in transit encryption	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	MEDIUM	2026-05-06 06:12:36.434422+00	2026-05-06 06:12:36.434422+00	\N
26f136f1-bf11-4279-93fa-36aa30df2a7a	Need to create infra level Gap for the SOC2 compliance	Need to create infra level Gap for the SOC2 compliance	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	LOW	2026-05-06 06:14:44.410253+00	2026-05-06 06:14:44.410253+00	\N
48a61717-1a2b-4eb6-8aca-0825d8d0a171	Need to update the Task due dates and deployment check list shared from the Uday and denys	Need to update the Task due dates and deployment check list shared from the Uday and denys	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	HIGH	2026-05-06 06:15:58.268817+00	2026-05-06 06:15:58.268817+00	\N
40a7951f-d6e7-4788-bae8-ea13b76f59f2	VAPT testing	Penetration testing in CASAI	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	IN_PROGRESS	MEDIUM	2026-05-07 06:06:20.564093+00	2026-05-07 06:06:20.564093+00	\N
70db8a6e-05e1-424e-9347-dbfa3fd0be39	Implemented improvements to the SDS search filter and added a new “Document Number” column to the SDS search results tab	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	COMPLETED	MEDIUM	2026-05-06 06:24:59.483371+00	2026-05-06 06:25:50.417+00	\N
474acd5b-f6dc-4612-92d1-7ddbebb42139	Worked on ticket for show new tab "Packing performance" in Packaging provision A2d section	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	COMPLETED	MEDIUM	2026-05-06 06:28:17.093907+00	2026-05-06 06:29:44.672+00	\N
b15cf0f9-9010-4226-8120-0cad7d355d9c	Worked on reopened ticket for SDS search filters	Worked on reopened ticket for SDS search filters, showed "ANY" in languages and countries filter, Fixed the issue with sorting in table columns, Discussed the other issues with Pavel and fixed it	ef04818d-604c-43e3-939a-34c1ef5661c5	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	COMPLETED	MEDIUM	2026-05-06 06:34:21.759967+00	2026-05-06 06:34:40.43+00	\N
9cf45e8d-5384-4adc-b2eb-e75fc203c0a9	Dispatch form_delete button for uplod	Add a delete button next to Download to remove attached SDS in dispatch tab form.	ef04818d-604c-43e3-939a-34c1ef5661c5	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	IN_PROGRESS	MEDIUM	2026-05-06 06:36:28.484467+00	2026-05-06 06:36:28.484467+00	\N
2aaa79e1-9595-45a8-b9e8-f9e9fe9c483d	Completed the BEL tab of IH settings for material name autocomplete issue. Test the different senarios and Created PR fo	Completed the BEL tab of IH settings for material name autocomplete issue. Test the different senarios and Created PR for it.	ef04818d-604c-43e3-939a-34c1ef5661c5	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	COMPLETED	MEDIUM	2026-05-06 07:01:12.919362+00	2026-05-06 07:01:13.006+00	\N
fe53ca2c-dbd2-4f6c-972a-426da701c092	Chemwatch	Connected with Sushil and helped him to complete the HPD layout related changes.\nUpdating CNS database on production regions.\nIdentified issues on BEL IH settings and aligned Harish on it.	ef04818d-604c-43e3-939a-34c1ef5661c5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	COMPLETED	MEDIUM	2026-05-07 06:11:51.475596+00	2026-05-07 06:16:16.223+00	\N
5af5df3d-b8bc-465e-ba2b-7590bcf905a5	Completed the BEL tab of IH settings for material name autocomplete issue. Test the different senarios and Created PR fo	Provide the PR to sergey m. and resolved the comments on the PR. Fixed the dark mode css. Merged and deployed the changes.\nAlso looked into the hazard rating issue in HPD report.	ef04818d-604c-43e3-939a-34c1ef5661c5	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	COMPLETED	MEDIUM	2026-05-06 07:04:44.082502+00	2026-05-06 07:04:44.179+00	\N
2c019fb9-1575-4d45-a0fb-ca512de532ae	Chemwatch	Update EUR region with CNS database.\nChecked HPD deployed on staging.\nConnected with Kiran on HPD rollup related changes.\nConnected with Sushil on HPD layout related changes.	ef04818d-604c-43e3-939a-34c1ef5661c5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	COMPLETED	MEDIUM	2026-05-07 06:12:29.384368+00	2026-05-07 06:16:28.59+00	\N
b830f3ab-6d0e-4111-a9a2-e2739127bfba	Incorrect hazard risc rating for 100% water	Investigate the hazard rating at docgen side also discussed with pavel, sergey and subhadip regarding this issue. And provide the details to subhadip so he will continue his investigation on it.	ef04818d-604c-43e3-939a-34c1ef5661c5	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	COMPLETED	MEDIUM	2026-05-06 07:07:20.962059+00	2026-05-06 07:07:21.052+00	\N
6e501eae-69dd-428e-b3d9-a8627a508c20	Chemwatch	Started looking into priv. ticket shared by Sergey.\nConnected with Sushil and provided an overview of EPD to him.\nConnected with Harish on OEL report. Clarified his queries.	ef04818d-604c-43e3-939a-34c1ef5661c5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	COMPLETED	MEDIUM	2026-05-07 06:12:52.87556+00	2026-05-07 06:16:36.606+00	\N
3d73883d-2cc6-4643-959f-933bd91f458c	DSU-BH	ok	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	COMPLETED	MEDIUM	2026-05-07 07:24:17.682663+00	2026-05-07 07:24:17.747+00	\N
6c318817-dfd8-4ecc-915b-2f7170dd27e9	Started the staging run and monitoring the build	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-06 17:09:53.590414+00	2026-05-07 14:01:39.616+00	\N
410fe3a7-cdf0-4810-8a47-ac3a433b751d	Test data for Transport 181 and automatiom	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-05 16:52:35.8201+00	2026-05-06 17:06:38.589+00	\N
c175e2ff-5618-47c6-b98a-93c36a27e7fb	Test data and start Automation of Transport 182	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-06 17:05:14.730953+00	2026-05-06 17:07:23.047+00	\N
9c572c5d-1db4-4811-8454-d1b9c6596bd2	Started the staging run and monitoring the build	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-06 17:09:44.649326+00	2026-05-07 14:01:56.492+00	\N
b18fe47a-eb94-419d-8238-1ac287fdfb1b	Test Data and start Automation of Transport 183	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-06 17:08:38.542989+00	2026-05-06 17:08:38.809+00	\N
8188d511-ba1e-4be8-a1c0-e33b2c2e0ec8	SSB DSU	\N	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	IN_PROGRESS	MEDIUM	2026-05-08 04:28:08.801581+00	2026-05-08 04:28:08.801581+00	\N
57179b52-99a7-45c3-a756-8fcbbb405199	Setup the meeting Sp1 Sp2	Setup meeting with Dr.Robert for confirmation of Sprints and issues	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-06 08:13:46.683722+00	2026-05-11 06:36:20.156+00	\N
65196aff-e27a-4a57-a704-a429f732038a	Track Items Pending with team	Data Breach issue\nClean up Data \nTickets anything urgent	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-06 08:20:37.825115+00	2026-05-11 06:35:51.232+00	\N
b458d091-f451-49a1-b328-fffab206ddfe	EPD Report	I was looking into the EPD report and understand the code as well.\nConnected with Hitender sir regarding the chemist toolbox.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-06 05:15:40.77924+00	2026-05-07 04:26:51.822+00	\N
5d9a2907-fb12-4f67-8053-3382187273da	Ih-api endpoints	The list of ih-api endpoint and identifying the required privileges with respect to those endpoints.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-07 04:25:47.129721+00	2026-05-07 04:27:32.161+00	\N
18ed5e34-5271-4f50-b35c-221f04e8cb3f	Sprint 1 and Sprint 2 Deliver to client	Delivery in prod	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-06 08:11:26.539226+00	2026-05-14 14:08:02.594+00	\N
a807ba0a-cd20-4141-a9c0-d866c2e7dd33	Chemist Toolbox	Connected with Hitender sir regarding the CT module not working on staging	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-07 04:29:10.957071+00	2026-05-07 04:29:11.023+00	\N
26c8682c-8978-4ee7-bdca-4360503c8028	AWS S3 bucket Permission	Need to check open buckets	720d14b4-711a-4b87-8ad1-3b1208fabaed	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	IN_PROGRESS	HIGH	2026-05-06 06:10:10.642393+00	2026-05-07 04:32:44.349+00	\N
8bd88e59-992d-470f-ae76-59b0276911f8	Track and discuss bug with team	Track the bugs from Robert	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-06 08:12:41.97413+00	2026-05-14 14:08:29.431+00	\N
36af1766-c046-4c43-9917-e989820a37f2	Chemwatch	Working on privilege sheet. Identifying and mentioning privileges for endpoints	ef04818d-604c-43e3-939a-34c1ef5661c5	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	COMPLETED	MEDIUM	2026-05-07 06:13:13.18905+00	2026-05-07 06:16:44.101+00	\N
3baf768a-4c5f-4371-b495-091151a1f7ef	OEL report	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	IN_PROGRESS	MEDIUM	2026-05-05 10:37:05.726234+00	2026-05-07 06:42:14.106+00	\N
c76c048e-e351-4a1d-9f0a-9a7ec57980ba	Analyzed staging issues and re-ran the scenarios after dev fixes.	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-07 13:58:51.413143+00	2026-05-07 13:58:51.799+00	\N
9236924c-64ae-4fa5-a693-c14745029dc1	Prepared the test data and completed the Transport183 scenario	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-07 14:01:21.069685+00	2026-05-07 14:01:21.357+00	\N
0ff727d9-3f7d-40e1-9b02-7de025fb5f4d	Worked on Chemsit-toolbox	Tested the chemist toolbox and identified a loading issue in the Molecule 3D tile.\nUpdated the RDS proxy IDs and deployed the changes to the staging environment.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-08 03:35:08.437987+00	2026-05-08 03:35:08.513+00	\N
00fab321-ae6a-4020-862c-b047370661cd	Day Planning and DSU updates	\N	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	COMPLETED	MEDIUM	2026-05-08 04:27:02.546663+00	2026-05-08 04:27:02.626+00	\N
ff452613-711e-4968-ba05-cfb16055a67e	Worked on Molecule 3D tile loading issue	Worked on Molecule 3D tile loading issue and when we change the material from my-cabinet then conflict the molecule 3D structure resolved this issue as well	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-08 03:36:19.065896+00	2026-05-11 11:27:41.901+00	\N
c62ad4cd-8d31-4eb0-a72b-50fbd9389153	Pushed all the tests and started build in Team city, Monitoring production build	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-07 14:00:07.611731+00	2026-05-15 17:05:41.128+00	\N
6e539a34-da7b-40b7-8deb-367efa66be42	SSB DSU	\N	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	IN_PROGRESS	MEDIUM	2026-05-08 04:28:21.279585+00	2026-05-08 04:28:21.279585+00	\N
e919b479-2516-4092-a541-207f901d658f	SSB DSU	\N	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	\N	7378db3c-09c2-46f8-b28a-a8a1e86f8822	IN_PROGRESS	MEDIUM	2026-05-08 04:28:33.584268+00	2026-05-08 04:28:33.584268+00	\N
ca260cd5-4904-4e9d-99d0-3c9b0d2ab684	BEE-14062	Cannot read properties of undefined issue	ef04818d-604c-43e3-939a-34c1ef5661c5	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	IN_PROGRESS	MEDIUM	2026-05-08 04:44:21.365616+00	2026-05-08 04:44:21.365616+00	\N
ddaa86a7-c41f-4cd5-bdf0-21de2972a376	vepsa model configuration	\N	c107877f-589a-4710-bb69-de69bc8921ca	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	IN_PROGRESS	MEDIUM	2026-05-08 05:48:21.15296+00	2026-05-08 05:48:21.15296+00	\N
5cd0f9a9-23e2-4fe2-90e2-366ef38e093f	Analysis Project Requirements	\N	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	COMPLETED	MEDIUM	2026-05-08 05:59:48.710666+00	2026-05-08 05:59:49.02+00	\N
259755a2-0984-4917-980a-45eee8fd2149	Research on features	\N	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	COMPLETED	MEDIUM	2026-05-08 06:10:04.544349+00	2026-05-08 06:10:04.783+00	\N
9781a58f-78f2-4139-a652-5266694ca193	New Requirement Discussion and Flow Planing	\N	a706bc8d-ad1e-42f7-af77-ab55add6075d	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	COMPLETED	MEDIUM	2026-05-08 06:17:52.262951+00	2026-05-08 06:17:52.411+00	\N
111fe9e6-6b87-4df3-aacb-9f6024673f56	R&D and Planning For LPU Session	\N	06063b94-3b48-48bf-bccb-c8712a61000d	\N	4f980d85-4b3f-45d3-8163-4dad2e229146	COMPLETED	MEDIUM	2026-05-08 06:22:43.909772+00	2026-05-08 06:22:44.066+00	\N
8bd02729-ac74-4925-8b67-b8962e2ab886	Demo to Sahil for product	\N	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-08 08:36:06.837719+00	2026-05-08 08:36:06.837719+00	\N
eaf9dfae-e9d2-46f6-928f-1518a5debd89	Ticket Focos	Tm carr call about focos	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-08 08:36:50.100953+00	2026-05-08 08:36:50.100953+00	\N
b5d1414c-bb63-43c6-972e-de8b3edc9fd6	Task : Track banti and saniya task	Assigned new task Banti and Saniya of respectively	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	LOW	2026-05-08 08:41:44.830924+00	2026-05-08 08:41:44.830924+00	\N
001056fb-d1a3-4443-aedf-18b404f5041e	HCMS Responsibility	Change responsibility change to Akarshit,email to client cc with sukdev sir	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-08 08:40:29.303096+00	2026-05-11 06:33:35.418+00	\N
88acb876-3ab1-436e-973e-a77145ab0809	Inveninous client  call	Track all tasks wiht mohit and joining call today	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-08 08:39:22.011639+00	2026-05-11 06:34:11.302+00	\N
276633b0-ec28-406a-9c7a-6f96b6654f7b	Testing the Staging Dr.Robert Points bug for Sp1 Sp2	Test Sprint 1 ,2 in staging	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-07 03:30:15.456896+00	2026-05-11 06:35:08.777+00	\N
c04b54e9-d205-4ae9-bb00-c5a9b3954471	Data Breach Discussion with Team	Angular Code testing for data Breach and asked sahil for solution	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-08 08:38:21.284218+00	2026-05-11 06:37:02.893+00	\N
66ea443a-bf00-41ca-af08-98cffa13b25d	Data Clean Up Task track	Assigned to Navjot need check completedtoday	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	IN_PROGRESS	MEDIUM	2026-05-11 06:39:10.545369+00	2026-05-11 06:39:10.545369+00	\N
5929261c-a1ac-4980-9133-79e342ddbff2	Discussed AI project Est and Document	\N	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-11 06:39:39.095571+00	2026-05-11 06:39:39.095571+00	\N
f985e6e2-eed1-4d2f-8797-03260e487b61	Sprint 3 & Sprint 4 Assigned to Team	\N	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	IN_PROGRESS	MEDIUM	2026-05-11 06:41:38.023253+00	2026-05-11 06:41:38.023253+00	\N
e0d84385-755f-4621-a10d-73d68340ef78	Track Team Saniya & Banti	Documentation wokring ,backend knowledge and other things \n-Ask review new tools for BA \n-Asked new testing tools for banti	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-11 06:42:58.728813+00	2026-05-11 06:42:58.728813+00	\N
f4cfb475-898b-4ea6-9a05-aad9d49bfcac	HPD production release	Revert the new layout code for HPD report and created the PR for that.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-11 11:25:27.634425+00	2026-05-11 11:25:27.722+00	\N
80a7e8e4-29f2-407c-bc86-663414c5d82c	Chemist Toolbox Prdo Release	Resolved merge conflicts while integrating the Sprint branch into Master for the Chemist Toolbox.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-11 11:26:05.451286+00	2026-05-12 03:33:11.417+00	\N
b3c324ac-f1ea-4b77-a59d-dd988d01d283	search db configuration and model deployment local	\N	c107877f-589a-4710-bb69-de69bc8921ca	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	IN_PROGRESS	MEDIUM	2026-05-12 07:39:36.309092+00	2026-05-12 07:39:36.309092+00	\N
13692cf2-1529-4952-91ce-29e9681111eb	Embedding Generation and Integration with Vespa	\N	c107877f-589a-4710-bb69-de69bc8921ca	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	TODO	MEDIUM	2026-05-12 07:39:56.371699+00	2026-05-12 07:39:56.371699+00	\N
4961b9fa-45fa-44db-93d9-d5d8ed9f118c	langfuse setup for observation	\N	c107877f-589a-4710-bb69-de69bc8921ca	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	085c53f6-2872-4c00-b3e3-6e93b9fb16ba	TODO	MEDIUM	2026-05-12 07:40:10.592324+00	2026-05-12 07:40:10.592324+00	\N
a2ebb328-d477-47a9-929b-126256ce4972	Completed the Transport 183 scenario and discussed new scenarios with Pavel	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-12 10:11:26.696284+00	2026-05-12 10:11:27.078+00	\N
55e898c9-49cc-40f6-9c8f-0819a0a52cb0	Ran and updated the test scenarios for Industrial Hygiene	All the scenarios passed	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-12 10:13:26.751348+00	2026-05-12 10:13:27.096+00	\N
8d3a395a-09e1-4b7d-8665-a26395694d93	Pushed the Industrial Hygiene scenarios to team and ran in Prod, Fixing the issue	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-12 10:16:52.819204+00	2026-05-12 10:16:53.113+00	\N
1964a002-17a0-42ff-a14c-d215381a64b4	Started and completed Transport 184 scenario	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-12 10:15:36.456667+00	2026-05-12 10:17:16.39+00	\N
6e622220-09de-472b-9d63-a5af288b1c00	Chemist Toolbox	Update environment variables for chemist-toolbox.	ef04818d-604c-43e3-939a-34c1ef5661c5	edc8df9b-d12e-4108-8a63-a3eb02084015	edc8df9b-d12e-4108-8a63-a3eb02084015	COMPLETED	MEDIUM	2026-05-13 04:15:21.842859+00	2026-05-13 04:15:21.927+00	\N
1495d953-30c9-40b0-a44a-5c30bebfacb9	BEE-14717	Code Refactor And Improvement in IH	ef04818d-604c-43e3-939a-34c1ef5661c5	55f65491-5988-4d63-928c-ad873d9fa687	55f65491-5988-4d63-928c-ad873d9fa687	IN_PROGRESS	MEDIUM	2026-05-13 04:45:44.043905+00	2026-05-13 04:45:44.043905+00	\N
cc6372f8-dcbd-4924-b570-e42bc9aff277	Text Changes in the frontend and deployment of the changes in the website	Text Changes in the frontend and deployment of the changes in the website	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	IN_PROGRESS	MEDIUM	2026-05-14 06:19:52.236134+00	2026-05-14 06:20:48.102+00	\N
14f80f6d-b39d-4e90-8dec-0e301f4ff9a4	Enable Transfer License Feature on the website	Enable Transfer License Feature on the website	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	COMPLETED	MEDIUM	2026-05-14 06:18:25.264914+00	2026-05-14 06:24:09.354+00	\N
6a78ec1a-9004-4015-a38a-1e4d3262120b	Testing of the Window Transfer Function with the Staging website	Testing of the Window Transfer Function with the Staging website	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	COMPLETED	MEDIUM	2026-05-14 06:16:22.908087+00	2026-05-14 06:24:55.328+00	\N
4aebbcd3-4f63-47ca-aef0-2dc1c7ef856e	enable Window transfer License	enable Window transfer License	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	COMPLETED	MEDIUM	2026-05-14 06:15:46.429783+00	2026-05-14 06:25:30.137+00	\N
2da24d8c-6751-4ec9-9282-76e7dd1743f2	Saniya & banti Track	Check About Zoho desk and tasks	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	LOW	2026-05-14 14:04:08.641948+00	2026-05-14 14:04:08.641948+00	\N
3bfa0da4-e3be-4700-be83-a4bc91a02857	Coordinate with release	\N	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-14 14:05:19.81567+00	2026-05-14 14:05:19.81567+00	\N
cc2a9f02-66b2-4f06-b67c-940c62623844	Discuss Client Release and stag for Heineken	\N	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-14 14:06:02.503263+00	2026-05-14 14:06:02.503263+00	\N
c376cf9f-3a9f-43d4-80b1-b70541faacb3	Sprint 1 and Sprint 2 -  Deliver to client 11/05	Bugs and Ui issues need close today	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-11 06:38:15.742221+00	2026-05-14 14:07:09.531+00	\N
51a2edc9-3c06-4c53-b038-8cdfdde082a8	Data Breach  Issue need closed	It went to manager of Manger it is very high priority	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	HIGH	2026-05-08 08:43:03.900577+00	2026-05-14 14:07:36.385+00	\N
fa0f2116-f111-4373-8129-b8ef77ef18bf	Ran and updated the test scenarios for Industrial Hygiene	All the scenarios passed	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-12 10:13:14.391664+00	2026-05-15 16:55:45.073+00	\N
996b78e5-7c53-4fb4-99b3-70f29d990c88	Ran and updated the test scenarios for Industrial Hygiene	All the scenarios passed	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-12 10:12:55.392499+00	2026-05-15 16:55:58.07+00	\N
15afd71e-cbc5-4254-91be-6a38893a18cb	Check Priority List	\N	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-14 14:06:26.55428+00	2026-05-14 14:06:26.55428+00	\N
5da5f525-a708-41fa-b859-5c62df491958	Focos Ticket need track	Tom carr ticker need track wiht team and deepak	720d14b4-711a-4b87-8ad1-3b1208fabaed	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	COMPLETED	MEDIUM	2026-05-11 06:40:41.72805+00	2026-05-14 14:06:48.461+00	\N
7efb2fe4-b92e-4761-a626-49688fbffbce	VAPT document	To share quotation with client	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	IN_PROGRESS	MEDIUM	2026-05-15 04:05:58.982638+00	2026-05-15 04:05:58.982638+00	\N
7bc24e9e-15db-464e-a641-620d11eb415d	Python- PDF conversion evaluation	Need to evaluate and estimate the task	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	TODO	MEDIUM	2026-05-15 04:06:44.429723+00	2026-05-15 04:06:44.429723+00	\N
b7f863ba-60b6-4350-880e-ff240ea650ee	Excel processing in Admin view	Create similar kind of feature in admin side as well	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	IN_PROGRESS	MEDIUM	2026-05-15 04:07:58.236294+00	2026-05-15 04:07:58.236294+00	\N
79ef2691-703a-4ca0-be76-f644b3ff1472	Auto re-load boq codes on new excel file up-load	\N	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	COMPLETED	MEDIUM	2026-05-15 04:12:06.762635+00	2026-05-15 04:12:49.04+00	\N
5a5914ce-2be5-4953-aa13-83b54e50c367	Started and completed scenario Transport 185	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-15 16:57:14.010849+00	2026-05-15 16:57:14.332+00	\N
0f30af72-2697-45ec-bd06-c4ac01fbb781	Ran all the Transport Tests in Staging and monitored the same.	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-15 16:58:14.553257+00	2026-05-15 16:58:14.871+00	\N
e07426ec-50c5-4700-8c1e-ccee1d88e85c	Pushed all the scenarios and updates into Team city and ran the transport module in Prod AUS	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-15 16:59:32.828206+00	2026-05-15 16:59:33.313+00	\N
f5bcc6d9-7c53-41c6-8bf2-20a7d78e7e3e	Demoed Transport 184 and Transport 185 to Pavel and got the info for Combination pkf format	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-15 17:00:28.531795+00	2026-05-15 17:00:28.844+00	\N
bbcbf38f-6dc7-4dd6-805f-6800acf59d55	Shared the Production test results in the group.	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-15 17:02:06.619377+00	2026-05-15 17:02:06.887+00	\N
c819d571-1ef8-4bbd-bad9-a6b7c42c5926	Hands on Transport 186 scenario, Started automating it and facing an issue needs discussion with Pavel	\N	ef04818d-604c-43e3-939a-34c1ef5661c5	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	COMPLETED	MEDIUM	2026-05-15 17:05:21.705747+00	2026-05-15 17:05:22.09+00	\N
df244a07-ff34-4f82-bf3a-eefc776cd56b	Mac Installer Deployment and Issue fix version number not reflecting	Mac Installer Deployment and Issue fix version number not reflecting	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	COMPLETED	MEDIUM	2026-05-18 04:56:08.851588+00	2026-05-18 04:57:03.996+00	\N
85ab3e63-091e-4761-937e-14d7a45a62ba	Clearing cache on every new media upload api hit	Clearing cache on every new media upload api hit	da2d585f-0d82-4023-b47c-e2e410bfea8a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	TODO	MEDIUM	2026-05-18 04:59:09.49867+00	2026-05-18 04:59:09.49867+00	\N
\.


--
-- Data for Name: time_logs; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.time_logs (id, user_id, task_id, project_id, date, start_time, end_time, time_spent_minutes, note, created_at, updated_at) FROM stdin;
8967f2f6-eac6-4851-8e39-c82c9db43911	4f980d85-4b3f-45d3-8163-4dad2e229146	fd5da34a-6252-4d3b-bd7b-819b3b715253	70f5be23-a5e3-4b1b-acd3-40a5ff06b9d4	2026-04-28	10:00:00	16:00:00	360	\N	2026-04-28 05:14:20.881443+00	2026-04-28 05:14:20.881443+00
cc09f6b9-efca-4aa3-8e79-ff935e38e677	4f980d85-4b3f-45d3-8163-4dad2e229146	fd5da34a-6252-4d3b-bd7b-819b3b715253	70f5be23-a5e3-4b1b-acd3-40a5ff06b9d4	2026-04-27	09:00:00	10:00:00	60	\N	2026-04-28 05:13:54.483409+00	2026-04-28 05:22:23.332+00
e38d8578-f2cf-4c5d-bf0f-09f37fc7f9b9	8542caa8-697c-4064-a45b-fc8fd3ae2732	3fc9637c-cc52-4f35-98fb-4e7f7eac3514	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	2026-04-28	09:00:00	10:00:00	60	Task has been completed	2026-04-28 07:06:50.249237+00	2026-04-28 07:06:50.249237+00
f375badd-8da6-461a-8ecc-441f8ebbe06e	8542caa8-697c-4064-a45b-fc8fd3ae2732	63caffdc-0891-4344-a27a-c7a250c882e0	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	2026-04-28	11:00:00	16:00:00	300	New Task assigned	2026-04-28 07:09:23.246236+00	2026-04-28 07:09:23.246236+00
fc0cdfab-c146-4e0d-8277-0f6b6d7b2a83	8542caa8-697c-4064-a45b-fc8fd3ae2732	c2f8aad0-bc56-4d72-b2ee-7411ceec69a7	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	2026-04-27	15:00:00	16:20:00	80	Tesk Created	2026-04-28 07:11:45.886709+00	2026-04-28 07:11:45.886709+00
88030832-d107-498a-8e4e-101d807d3d7b	8542caa8-697c-4064-a45b-fc8fd3ae2732	df7b37bb-067f-4956-a341-55503420489b	e52617ba-6e0c-44b9-b91a-a90c4188571b	2026-04-27	09:00:00	10:00:00	60	Done	2026-04-28 07:12:56.50027+00	2026-04-28 07:12:56.50027+00
dcae1f6b-1650-4d5c-a2d5-946ecde5922a	8542caa8-697c-4064-a45b-fc8fd3ae2732	8a92358b-27db-4ece-a390-852844ddd7a5	e52617ba-6e0c-44b9-b91a-a90c4188571b	2026-04-24	09:00:00	10:00:00	60	Test	2026-04-28 07:13:57.243982+00	2026-04-28 07:13:57.243982+00
8006fce9-9b3a-43fd-8132-3939dd865bb6	4f980d85-4b3f-45d3-8163-4dad2e229146	5c3c9814-fcd4-4dd7-a935-b1665cc63bf9	e52617ba-6e0c-44b9-b91a-a90c4188571b	2026-04-28	09:00:00	10:00:00	60	\N	2026-04-28 07:19:57.420554+00	2026-04-28 07:19:57.420554+00
0dd0293f-7db4-4e19-9c7d-118004fac458	8542caa8-697c-4064-a45b-fc8fd3ae2732	df7b37bb-067f-4956-a341-55503420489b	e52617ba-6e0c-44b9-b91a-a90c4188571b	2026-04-30	09:00:00	10:00:00	60	Done Had Good Discussion	2026-04-30 04:44:24.970773+00	2026-04-30 04:44:24.970773+00
bdb585cd-db13-436b-9482-42d34ac85821	8542caa8-697c-4064-a45b-fc8fd3ae2732	8a92358b-27db-4ece-a390-852844ddd7a5	e52617ba-6e0c-44b9-b91a-a90c4188571b	2026-04-29	09:00:00	10:00:00	60	Also Done	2026-04-30 04:45:27.933177+00	2026-04-30 04:45:27.933177+00
84705490-4917-46d6-ad6b-655dd870aa3e	8542caa8-697c-4064-a45b-fc8fd3ae2732	83fde455-098b-4e56-9705-f43e7a16fb5c	e52617ba-6e0c-44b9-b91a-a90c4188571b	2026-04-07	09:00:00	10:00:00	60	Test - Test - Test	2026-04-30 04:57:04.739812+00	2026-04-30 04:57:04.739812+00
92e681d7-fc81-49ed-a571-e79457081a9c	8542caa8-697c-4064-a45b-fc8fd3ae2732	e43f6b37-81bc-4c4e-9fdd-626cfddb6c41	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	2026-04-08	09:00:00	10:00:00	60	Done	2026-04-30 04:58:28.29249+00	2026-04-30 04:58:28.29249+00
a657df74-1424-4599-837a-588ce868fbce	8542caa8-697c-4064-a45b-fc8fd3ae2732	e43f6b37-81bc-4c4e-9fdd-626cfddb6c41	f08aff21-8840-4cf6-ae77-d6fdfff5d5b4	2026-04-14	09:00:00	10:00:00	60	\N	2026-04-30 05:01:18.238483+00	2026-04-30 05:01:18.238483+00
048d9a20-e9ad-45a8-b82e-c4f08c735f5e	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	c175e2ff-5618-47c6-b98a-93c36a27e7fb	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	13:15:00	15:30:00	135	\N	2026-05-06 17:07:23.044973+00	2026-05-06 17:07:23.044973+00
38bd3f32-27bb-4c54-9195-9fdfa775dc4f	edc8df9b-d12e-4108-8a63-a3eb02084015	dcaec9db-84ca-49b2-8eea-e57bd88e9c61	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	10:00:00	18:00:00	480	\N	2026-05-05 07:39:30.1499+00	2026-05-06 05:19:09.436+00
5ed01cc0-d22e-4d4f-88d3-26d7068cf8d7	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	70db8a6e-05e1-424e-9347-dbfa3fd0be39	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-01	10:00:00	18:00:00	480	\N	2026-05-06 06:24:59.544189+00	2026-05-06 06:24:59.544189+00
5ae71bb7-180a-402d-ad08-95caee01e730	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	5ee26848-89dd-4f49-8894-1fc8107e0928	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	09:00:00	16:00:00	420	\N	2026-05-05 08:35:50.330991+00	2026-05-05 08:35:50.330991+00
fc36f077-d526-461a-abaf-e5f68ca314a6	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	b18fe47a-eb94-419d-8238-1ac287fdfb1b	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	15:30:00	17:45:00	135	\N	2026-05-06 17:08:38.807145+00	2026-05-06 17:08:38.807145+00
2fcaa6d0-bed5-45c8-8a60-ae7419a08018	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	70db8a6e-05e1-424e-9347-dbfa3fd0be39	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	10:00:00	13:00:00	180	\N	2026-05-06 06:25:17.208041+00	2026-05-06 06:25:50.414+00
e956b9b0-2635-4b27-a5b2-45b9919a330b	edc8df9b-d12e-4108-8a63-a3eb02084015	b0c80d5d-5ca7-46e6-88e8-536985b3e22a	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-01	10:00:00	18:00:00	480	\N	2026-05-05 07:29:04.301242+00	2026-05-05 09:29:32.821+00
47759a22-e86b-4239-81b4-c5a92cd75b60	edc8df9b-d12e-4108-8a63-a3eb02084015	3d90ff12-0032-40fb-b364-767d814eb863	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	10:00:00	18:00:00	480	\N	2026-05-05 07:33:54.841341+00	2026-05-05 09:29:44.508+00
68cdcba3-da05-4657-8693-832cc74b67a9	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	474acd5b-f6dc-4612-92d1-7ddbebb42139	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	13:00:00	18:00:00	300	\N	2026-05-06 06:28:17.149901+00	2026-05-06 06:28:40.752+00
74620351-d8bf-4fb0-bd0c-f173378a1da9	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	474acd5b-f6dc-4612-92d1-7ddbebb42139	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	10:00:00	12:00:00	120	\N	2026-05-06 06:29:44.668114+00	2026-05-06 06:29:44.668114+00
61a9002d-f696-41c3-b8ee-a698235f4a12	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	6fcd22d5-69f7-4152-ba19-d63afddd4167	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-01	10:30:00	18:10:00	460	fixed the notification messages to suitable context	2026-05-05 10:30:07.407195+00	2026-05-05 10:30:07.407195+00
f7237c32-603c-4cca-8018-8ba95c821fd3	55f65491-5988-4d63-928c-ad873d9fa687	592933a6-563b-4ad6-95df-e3e2b9283842	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	10:00:00	19:00:00	540	Started on investigated issue in master branch\nAlso looked into all the modules that have been needed to deployed in current scope of sprint	2026-05-05 10:25:52.402176+00	2026-05-05 10:31:19.213+00
1fbd38ef-d9c3-4e19-af8a-5e2d2fcff927	55f65491-5988-4d63-928c-ad873d9fa687	28a8557e-6afa-4fd3-b2a3-ac1cfc034562	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-01	10:00:00	19:00:00	540	Worked with harish on fixing and improving the autocomplete functionality	2026-05-05 10:28:51.378616+00	2026-05-05 10:31:36.048+00
975aac7e-2f81-4e6c-9e65-ce5c1a4f5674	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	0f73bef5-93d9-4404-bbac-8d55f47e86ae	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	10:20:00	15:00:00	280	added the disabled functionality for whole A2 section while we don't selected the A1 section's	2026-05-05 10:33:50.272002+00	2026-05-05 10:33:50.272002+00
ea1e77f7-e7fb-47e7-b017-4ba2b8a342a9	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	e6efd600-ccc6-47cd-988d-737833c50005	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	15:15:00	18:05:00	170	update the hazardous shipment info query for both overpack and non overpack items	2026-05-05 10:35:04.965497+00	2026-05-05 10:35:04.965497+00
a343f8ef-88c8-416b-8d89-41eb69ebe3e9	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	360e729a-9153-49a7-9bc2-faaef113d100	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	10:00:00	18:00:00	480	Discussed the ticket requirement with the Pavel. Try to reproduced the issue.	2026-05-05 10:36:32.153111+00	2026-05-05 10:36:32.153111+00
c3602609-14dd-446c-9f37-af9e3285e979	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	d3a51bd8-420c-413d-a36a-7750b4e6e5fd	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	09:00:00	18:30:00	570	\N	2026-05-05 10:37:24.139759+00	2026-05-05 10:37:24.139759+00
2196883a-d9d5-4289-92e0-d1bb6f749a19	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	6c318817-dfd8-4ecc-915b-2f7170dd27e9	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	17:50:00	20:30:00	160	\N	2026-05-06 17:12:19.690336+00	2026-05-06 17:12:19.690336+00
66f8fa32-a6fe-4bd4-a5e7-e7a80acf051d	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	b15cf0f9-9010-4226-8120-0cad7d355d9c	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	12:00:00	18:00:00	360	\N	2026-05-06 06:34:21.843459+00	2026-05-06 06:34:40.427+00
ad233769-6478-4d6b-abd8-56ee2defee33	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	9cf45e8d-5384-4adc-b2eb-e75fc203c0a9	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	10:00:00	18:00:00	480	\N	2026-05-06 06:36:28.552524+00	2026-05-06 06:36:28.552524+00
30a01643-b441-4eba-a5ee-a5dd317e95b0	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2aaa79e1-9595-45a8-b9e8-f9e9fe9c483d	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-01	10:00:00	19:00:00	540	\N	2026-05-06 07:01:13.002703+00	2026-05-06 07:01:13.002703+00
d8938fa9-ac4f-40f3-a793-5753d4ca6c92	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	5af5df3d-b8bc-465e-ba2b-7590bcf905a5	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	10:00:00	17:00:00	420	\N	2026-05-06 07:04:44.176839+00	2026-05-06 07:04:44.176839+00
9c9fee83-3e8e-4074-910b-cfe50912637a	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	b830f3ab-6d0e-4111-a9a2-e2739127bfba	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	10:00:00	12:35:00	155	\N	2026-05-06 07:07:21.050562+00	2026-05-06 07:07:21.050562+00
d40fab60-189f-4404-8d49-1c2886dc1439	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	8bd88e59-992d-470f-ae76-59b0276911f8	720d14b4-711a-4b87-8ad1-3b1208fabaed	2026-05-06	09:00:00	23:35:00	875	\N	2026-05-06 08:16:55.868191+00	2026-05-06 08:16:55.868191+00
11eccfc4-b564-481b-93ec-a7f6c6da6e9d	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	410fe3a7-cdf0-4810-8a47-ac3a433b751d	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	16:00:00	18:00:00	120	\N	2026-05-05 16:52:36.130701+00	2026-05-06 17:01:57.854+00
7e95c2e6-30f1-46d8-b305-bcbbb0a1f9ed	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	410fe3a7-cdf0-4810-8a47-ac3a433b751d	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	10:00:00	13:00:00	180	\N	2026-05-06 04:59:53.787527+00	2026-05-06 17:06:38.587+00
0a9cdc56-a783-48df-866c-9e34570645cb	edc8df9b-d12e-4108-8a63-a3eb02084015	b458d091-f451-49a1-b328-fffab206ddfe	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	10:00:00	12:00:00	120	\N	2026-05-06 05:15:40.84568+00	2026-05-07 04:26:51.818+00
f0f2516a-62cc-4d38-9cea-c4ba252a8d45	edc8df9b-d12e-4108-8a63-a3eb02084015	5d9a2907-fb12-4f67-8053-3382187273da	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	12:00:00	17:00:00	300	\N	2026-05-07 04:27:32.158491+00	2026-05-07 04:27:32.158491+00
8ed7eb71-3406-4b82-a886-8a732d777e53	edc8df9b-d12e-4108-8a63-a3eb02084015	a807ba0a-cd20-4141-a9c0-d866c2e7dd33	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	17:00:00	18:00:00	60	\N	2026-05-07 04:29:11.02042+00	2026-05-07 04:29:11.02042+00
f62deedb-119d-4338-ad45-6c0ca93d1933	244865e0-bd63-4df2-bab6-bfb1cd2799e3	6f125570-c26f-45bf-9512-0f0ae2761b3e	720d14b4-711a-4b87-8ad1-3b1208fabaed	2026-05-07	09:00:00	10:00:00	60	Deployment of backend release-backend-20260506.1543 on staging	2026-05-07 04:47:09.246592+00	2026-05-07 04:47:09.246592+00
1dda8895-c5f6-4155-8798-0b4a1ad8e7d4	244865e0-bd63-4df2-bab6-bfb1cd2799e3	49b1424e-311d-41bd-8fce-22618ef1e6bb	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-01	09:35:00	19:00:00	565	Issue is due to WAF enabled on the production	2026-05-07 04:42:13.213936+00	2026-05-07 04:42:13.213936+00
2cf199ef-5cc0-4497-836e-aa541c756ca6	244865e0-bd63-4df2-bab6-bfb1cd2799e3	7bcdb40b-7404-4d21-8328-c464744d96b1	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-04-28	09:30:00	17:50:00	500	\N	2026-05-07 04:38:02.485214+00	2026-05-07 04:38:22.705+00
8d4daefd-0eab-4e1d-9242-8a057dd8676e	244865e0-bd63-4df2-bab6-bfb1cd2799e3	7bcdb40b-7404-4d21-8328-c464744d96b1	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-04-29	09:30:00	19:00:00	570	attached cloudfront with internal secure media as well with key encryption	2026-05-07 04:36:55.44233+00	2026-05-07 04:38:34.704+00
87a02162-a4a2-4c33-acee-e9a5650c3ae4	244865e0-bd63-4df2-bab6-bfb1cd2799e3	6f125570-c26f-45bf-9512-0f0ae2761b3e	720d14b4-711a-4b87-8ad1-3b1208fabaed	2026-05-06	20:00:00	20:55:00	55	\N	2026-05-07 04:45:04.107108+00	2026-05-07 04:46:12.737+00
0cd45fe1-4327-4fef-8c85-d41ed5180470	244865e0-bd63-4df2-bab6-bfb1cd2799e3	8883ef64-242d-4c2d-a74d-57f0e286d8db	720d14b4-711a-4b87-8ad1-3b1208fabaed	2026-05-06	14:00:00	15:00:00	60	\N	2026-05-07 04:33:51.754923+00	2026-05-07 04:46:31.337+00
75b56fb9-2e18-48dc-8b24-39b6daf318c6	244865e0-bd63-4df2-bab6-bfb1cd2799e3	73addaac-60b9-4a37-b766-bd1c75107491	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-06	15:00:00	17:00:00	120	\N	2026-05-07 04:34:21.097129+00	2026-05-07 04:46:40.489+00
16d7f44d-1ab9-4226-8701-7c9a32502aee	244865e0-bd63-4df2-bab6-bfb1cd2799e3	26c8682c-8978-4ee7-bdca-4360503c8028	720d14b4-711a-4b87-8ad1-3b1208fabaed	2026-05-06	09:00:00	13:00:00	240	\N	2026-05-07 04:32:44.346701+00	2026-05-07 04:46:48.548+00
81b3cfef-87f6-45b7-8c5d-7ea71b3a9ea7	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	fe53ca2c-dbd2-4f6c-972a-426da701c092	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-01	09:00:00	18:00:00	540	\N	2026-05-07 06:11:51.560198+00	2026-05-07 06:11:51.560198+00
bcc515f7-70a9-4744-949e-babc682fc3a2	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2c019fb9-1575-4d45-a0fb-ca512de532ae	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-04	09:00:00	18:00:00	540	\N	2026-05-07 06:12:29.451555+00	2026-05-07 06:12:29.451555+00
e3b0f841-56b6-4746-81fd-f9956d42922c	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	6e501eae-69dd-428e-b3d9-a8627a508c20	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	09:00:00	18:00:00	540	\N	2026-05-07 06:12:52.972257+00	2026-05-07 06:12:52.972257+00
fdbba42d-de90-4bfa-94cd-9a84b4c53724	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	36af1766-c046-4c43-9917-e989820a37f2	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	09:00:00	18:00:00	540	\N	2026-05-07 06:13:13.250909+00	2026-05-07 06:13:13.250909+00
e79aa9e8-2ab2-4f7e-810b-3d9b09382788	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	3baf768a-4c5f-4371-b495-091151a1f7ef	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-06	13:00:00	18:00:00	300	\N	2026-05-07 06:42:14.102657+00	2026-05-07 06:42:14.102657+00
70b69eab-0702-4431-8ab0-3603849f1c7a	7378db3c-09c2-46f8-b28a-a8a1e86f8822	3d73883d-2cc6-4643-959f-933bd91f458c	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	2026-05-07	10:00:00	10:30:00	30	Ok.	2026-05-07 07:24:17.744626+00	2026-05-07 07:24:17.744626+00
dee73470-65e5-46d2-b6e5-cbe7b9d98d81	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	c76c048e-e351-4a1d-9f0a-9a7ec57980ba	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-07	10:00:00	12:00:00	120	\N	2026-05-07 13:58:51.796532+00	2026-05-07 13:58:51.796532+00
4accc3aa-54c5-4d05-9028-3ccf9868af4c	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	c62ad4cd-8d31-4eb0-a72b-50fbd9389153	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-07	12:05:00	18:05:00	360	\N	2026-05-07 14:00:08.618444+00	2026-05-07 14:00:08.618444+00
abf73e7c-8844-4ad6-953d-f65d51bfe6b3	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	9236924c-64ae-4fa5-a693-c14745029dc1	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-07	18:35:00	20:30:00	115	\N	2026-05-07 14:01:21.35398+00	2026-05-07 14:01:21.35398+00
3c1248ff-ff88-4983-8928-2573f180af5d	edc8df9b-d12e-4108-8a63-a3eb02084015	0ff727d9-3f7d-40e1-9b02-7de025fb5f4d	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-07	10:00:00	18:00:00	480	\N	2026-05-08 03:35:08.509856+00	2026-05-08 03:35:08.509856+00
657be351-ecc5-4770-9b94-86b7af1f2790	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	0f30af72-2697-45ec-bd06-c4ac01fbb781	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-13	15:05:00	18:10:00	185	\N	2026-05-15 16:58:14.868622+00	2026-05-15 16:58:14.868622+00
906aafaa-f3bb-447e-b5e2-2f7f35a4ccd0	7378db3c-09c2-46f8-b28a-a8a1e86f8822	00fab321-ae6a-4020-862c-b047370661cd	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	2026-05-08	09:30:00	10:30:00	60	\N	2026-05-08 04:27:02.62354+00	2026-05-08 04:27:02.62354+00
9bb8a14b-7ef7-4666-b8fa-8c043cb03256	7378db3c-09c2-46f8-b28a-a8a1e86f8822	e919b479-2516-4092-a541-207f901d658f	49af7e14-3b9b-4f61-bdbd-ee5df3ade77e	2026-05-08	10:35:00	11:00:00	25	DSU	2026-05-08 04:28:33.648405+00	2026-05-08 04:28:33.648405+00
b2794396-56a4-427c-ada1-ed7f9bfa1bad	55f65491-5988-4d63-928c-ad873d9fa687	ca260cd5-4904-4e9d-99d0-3c9b0d2ab684	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-05	10:00:00	16:00:00	360	Fixed production issue of getting undefined property in BEE-14062	2026-05-08 04:44:21.49153+00	2026-05-08 04:44:21.49153+00
eb09e06d-a760-41ff-8278-7d66298eac54	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	3baf768a-4c5f-4371-b495-091151a1f7ef	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-07	10:00:00	19:00:00	540	Continue working on the OEL report. Started working on the docgen side.\nWorking on the OEL report model for the calculation of OEL report.	2026-05-08 04:44:56.113321+00	2026-05-08 04:44:56.113321+00
0036e735-3b1b-4be8-a816-54dfd3fd12f6	4f980d85-4b3f-45d3-8163-4dad2e229146	5cd0f9a9-23e2-4fe2-90e2-366ef38e093f	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	2026-05-04	09:00:00	16:00:00	420	\N	2026-05-08 05:59:49.018034+00	2026-05-08 05:59:49.018034+00
e9c4e366-4c33-4974-8c77-6676bd448529	4f980d85-4b3f-45d3-8163-4dad2e229146	259755a2-0984-4917-980a-45eee8fd2149	22be8e7b-c8ee-43b8-a387-4ee86b200ccd	2026-05-05	10:00:00	13:00:00	180	\N	2026-05-08 06:10:04.780542+00	2026-05-08 06:10:04.780542+00
d0686925-8e3d-4a2d-bc67-6e70a778a5e0	4f980d85-4b3f-45d3-8163-4dad2e229146	9781a58f-78f2-4139-a652-5266694ca193	a706bc8d-ad1e-42f7-af77-ab55add6075d	2026-05-05	15:00:00	18:00:00	180	\N	2026-05-08 06:17:52.40858+00	2026-05-08 06:17:52.40858+00
d977c910-25b7-4f0b-a2ab-460b3d598387	4f980d85-4b3f-45d3-8163-4dad2e229146	111fe9e6-6b87-4df3-aacb-9f6024673f56	06063b94-3b48-48bf-bccb-c8712a61000d	2026-05-07	10:00:00	13:00:00	180	\N	2026-05-08 06:22:44.063218+00	2026-05-08 06:22:44.063218+00
ffb87d1d-d7c9-4a9f-a5e5-93c3ee4e7d2a	edc8df9b-d12e-4108-8a63-a3eb02084015	f4cfb475-898b-4ea6-9a05-aad9d49bfcac	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-11	10:00:00	12:00:00	120	\N	2026-05-11 11:25:27.719473+00	2026-05-11 11:25:27.719473+00
5f03a987-e0a1-4321-8878-26f1ae0889d8	edc8df9b-d12e-4108-8a63-a3eb02084015	80a7e8e4-29f2-407c-bc86-663414c5d82c	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-11	12:00:00	18:00:00	360	\N	2026-05-11 11:26:05.523944+00	2026-05-11 11:26:05.523944+00
62fef9cc-c089-4c27-9f27-1a6822de05ea	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	e07426ec-50c5-4700-8c1e-ccee1d88e85c	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-14	14:00:00	21:00:00	420	\N	2026-05-15 16:59:33.310762+00	2026-05-15 16:59:33.310762+00
91fcb4e4-f531-4ba8-81e7-285421a6df5b	edc8df9b-d12e-4108-8a63-a3eb02084015	ff452613-711e-4968-ba05-cfb16055a67e	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-08	10:00:00	18:00:00	480	\N	2026-05-08 03:36:19.127212+00	2026-05-11 11:27:41.898+00
346b0d91-0d82-4cae-821c-c4e4992f3148	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	a2ebb328-d477-47a9-929b-126256ce4972	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-08	09:00:00	16:00:00	420	\N	2026-05-12 10:11:27.075302+00	2026-05-12 10:11:27.075302+00
91c56ce3-db44-406a-9dd4-200e50c3b27a	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	55e898c9-49cc-40f6-9c8f-0819a0a52cb0	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-08	16:00:00	19:00:00	180	\N	2026-05-12 10:13:27.094287+00	2026-05-12 10:13:27.094287+00
dc5cb2fe-ea78-4b9a-a884-d80c095de305	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	1964a002-17a0-42ff-a14c-d215381a64b4	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-12	10:00:00	14:00:00	240	\N	2026-05-12 10:15:36.770547+00	2026-05-12 10:15:36.770547+00
901134b1-4d03-41c7-9dc3-cf33d8285cc1	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	8d3a395a-09e1-4b7d-8665-a26395694d93	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-12	14:05:00	18:10:00	245	\N	2026-05-12 10:16:53.111521+00	2026-05-12 10:16:53.111521+00
e8d67cc4-55c7-4abd-9549-f8cd18841672	edc8df9b-d12e-4108-8a63-a3eb02084015	6e622220-09de-472b-9d63-a5af288b1c00	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-12	10:00:00	18:00:00	480	\N	2026-05-13 04:15:21.924975+00	2026-05-13 04:15:21.924975+00
da7e084f-afc9-4559-b3fc-174bcf8cccf0	55f65491-5988-4d63-928c-ad873d9fa687	1495d953-30c9-40b0-a44a-5c30bebfacb9	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-12	10:00:00	19:10:00	550	Code Refactor And Improvement in IH , also been connect with alex and pavel for helping them understand implementations	2026-05-13 04:45:44.174339+00	2026-05-13 04:45:44.174339+00
0b431d6c-f1ef-48e1-871c-e0e43ee55086	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	3baf768a-4c5f-4371-b495-091151a1f7ef	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-08	10:00:00	19:00:00	540	Continue working on the OEL report. Started working on the docgen side.\nWorking on the OEL report model for OEL report.	2026-05-14 06:04:19.003428+00	2026-05-14 06:04:19.003428+00
36d7821c-7596-4d37-9b79-56a542280d64	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	3baf768a-4c5f-4371-b495-091151a1f7ef	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-11	10:00:00	19:00:00	540	Continue working on the OEL report. Started working on the docgen side.\nWorking on the OEL report model for OEL report.	2026-05-14 06:04:59.64713+00	2026-05-14 06:04:59.64713+00
d0001de9-9b95-468d-ba63-e4ed8834da16	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	3baf768a-4c5f-4371-b495-091151a1f7ef	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-12	10:00:00	19:00:00	540	Continue working on the OEL report. Started working on the docgen side.\nWorking on the OEL report model for OEL report and try to generate the OEL report with test application.	2026-05-14 06:05:35.927853+00	2026-05-14 06:05:35.927853+00
0b22c46b-afe7-4504-ab63-fadda8327833	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	3baf768a-4c5f-4371-b495-091151a1f7ef	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-13	10:00:00	19:00:00	540	Continue working on the OEL report. Started working on the docgen side.\nWorking on the OEL report model for OEL report and try to generate the OEL report with test application.\nAlso working on the OEL xslt for the desire structure of report.	2026-05-14 06:06:06.402439+00	2026-05-14 06:06:06.402439+00
592238b0-aef7-4f28-90e8-1c5c5abc4398	244865e0-bd63-4df2-bab6-bfb1cd2799e3	4aebbcd3-4f63-47ca-aef0-2dc1c7ef856e	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-12	09:00:00	19:00:00	600	\N	2026-05-14 06:16:54.67894+00	2026-05-14 06:16:54.67894+00
1bd21d6b-b0be-4e8a-adcf-406257f63bae	244865e0-bd63-4df2-bab6-bfb1cd2799e3	14f80f6d-b39d-4e90-8dec-0e301f4ff9a4	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-13	09:00:00	12:00:00	180	\N	2026-05-14 06:18:57.640463+00	2026-05-14 06:19:03.834+00
348675fa-e596-41bf-b509-406b19686f1a	244865e0-bd63-4df2-bab6-bfb1cd2799e3	6a78ec1a-9004-4015-a38a-1e4d3262120b	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-13	15:00:00	19:00:00	240	Tested and fix bug in the transfer License.	2026-05-14 06:17:43.6146+00	2026-05-14 06:19:23.468+00
1749dcfc-890e-4267-8ddd-ae737213a4a4	244865e0-bd63-4df2-bab6-bfb1cd2799e3	cc6372f8-dcbd-4924-b570-e42bc9aff277	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-13	12:00:00	15:00:00	180	\N	2026-05-14 06:20:48.100955+00	2026-05-14 06:21:44.162+00
d158aa02-5957-4411-b056-f46c28ac0321	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	79ef2691-703a-4ca0-be76-f644b3ff1472	ab9b33a6-dab6-4f0e-bb16-6208e41ee5c1	2026-05-14	09:00:00	17:00:00	480	\N	2026-05-15 04:12:49.036763+00	2026-05-15 04:12:49.036763+00
464526e0-7dba-439c-a8b0-ce6d2ad6a8c4	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	5a5914ce-2be5-4953-aa13-83b54e50c367	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-13	10:00:00	15:00:00	300	\N	2026-05-15 16:57:14.328808+00	2026-05-15 16:57:14.328808+00
e3ed3146-d0ef-4c0b-9781-0370ae01aa7e	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	f5bcc6d9-7c53-41c6-8bf2-20a7d78e7e3e	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-14	10:00:00	13:55:00	235	\N	2026-05-15 17:00:28.842129+00	2026-05-15 17:00:28.842129+00
bb705e1e-e3db-4022-af34-e5c3f118b856	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	bbcbf38f-6dc7-4dd6-805f-6800acf59d55	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-15	10:00:00	11:00:00	60	\N	2026-05-15 17:02:06.885299+00	2026-05-15 17:02:06.885299+00
d7cc68ae-407c-43f9-b0be-0061faf1df05	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	c819d571-1ef8-4bbd-bad9-a6b7c42c5926	ef04818d-604c-43e3-939a-34c1ef5661c5	2026-05-15	11:05:00	18:10:00	425	\N	2026-05-15 17:05:22.087849+00	2026-05-15 17:05:22.087849+00
05f8df13-9cfe-407f-b12f-3c57d4744279	244865e0-bd63-4df2-bab6-bfb1cd2799e3	df244a07-ff34-4f82-bf3a-eefc776cd56b	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-04	09:00:00	15:00:00	360	Fixed the issue related to version number not uploaded properly	2026-05-18 04:57:03.992628+00	2026-05-18 04:57:03.992628+00
065f3d4b-69a7-45fd-8aae-3029e08e907c	244865e0-bd63-4df2-bab6-bfb1cd2799e3	73addaac-60b9-4a37-b766-bd1c75107491	da2d585f-0d82-4023-b47c-e2e410bfea8a	2026-05-18	09:00:00	18:00:00	540	Working and deployed on the staging , on every Marketing API upload now we are invalidating cache.	2026-05-18 05:02:47.357634+00	2026-05-18 05:02:47.357634+00
\.


--
-- Data for Name: timesheet_exports; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.timesheet_exports (id, token, created_by, file_name, filters_json, expires_at, created_at, updated_at) FROM stdin;
dfd393ec-bac6-41e4-86c7-ebfea1ceab54	f0511f66d495828bc2e611d847cb1eeb986ec69821b4e53d	4f980d85-4b3f-45d3-8163-4dad2e229146	Testsheet	{"mode": "current", "toDate": "2026-04-30", "fromDate": "2026-01-01"}	\N	2026-04-28 05:15:27.595477+00	2026-04-28 05:15:27.594+00
4fb7c6a5-3095-405e-8fd8-8db8d5195ef6	49a429044fa246b691f6c016adf4853c05b15db383eb78ff	4f980d85-4b3f-45d3-8163-4dad2e229146	team-timesheet-2026-04-28	{"mode": "current", "toDate": "2026-04-30", "fromDate": "2026-01-01"}	2026-04-28 18:29:59.999+00	2026-04-28 05:17:36.591787+00	2026-04-28 05:17:36.59+00
f80b2e58-aff4-4540-ae38-546e333b1c3a	d6e643a4479d2b2a30abe38393d38a32d5d7cd1cb38b6845	4f980d85-4b3f-45d3-8163-4dad2e229146	team-timesheet-2026-04-30	{"mode": "current", "toDate": "2026-04-30", "fromDate": "2026-02-01", "projectIds": ["e52617ba-6e0c-44b9-b91a-a90c4188571b"]}	\N	2026-04-30 04:48:02.938579+00	2026-04-30 04:48:02.938+00
\.


--
-- Data for Name: timesheet_statuses; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.timesheet_statuses (id, user_id, date, status, is_leave, leave_source, created_at, updated_at) FROM stdin;
343aeadf-220f-4f9b-9dad-f5062f362342	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-13	DRAFT	f	\N	2026-05-14 06:06:06.409148+00	2026-05-14 06:06:06.409148+00
049eec63-bccd-4a95-889d-454a5b2dab30	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-27	DRAFT	f	\N	2026-04-28 05:22:23.338074+00	2026-04-28 05:22:23.338074+00
834c9879-9238-49ed-9aaa-4d41a9e85cee	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-28	DRAFT	f	\N	2026-04-28 07:06:50.254105+00	2026-04-28 07:09:23.248+00
12c7775b-bc63-42ad-8c0e-b57c8d952e32	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-27	DRAFT	f	\N	2026-04-28 07:11:45.893932+00	2026-04-28 07:12:56.504+00
af2ce0a8-1e9a-4f53-b740-0036051cbdb5	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-24	DRAFT	f	\N	2026-04-28 07:13:57.250962+00	2026-04-28 07:13:57.250962+00
bf4c69eb-b0c4-48b9-af7b-d85a6ea59e44	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-04-28	DRAFT	f	\N	2026-04-28 05:13:54.489979+00	2026-04-28 07:19:57.423+00
dc8d9eff-d29e-45d1-9482-8102f0536066	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-30	DRAFT	f	\N	2026-04-30 04:44:24.975102+00	2026-04-30 04:44:24.975102+00
33d638ee-21ba-41d7-b81f-33b23a8e6f67	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-29	DRAFT	f	\N	2026-04-30 04:45:27.937433+00	2026-04-30 04:45:27.937433+00
92f8592f-2d02-4393-91ba-5dfcefddd55c	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-07	DRAFT	f	\N	2026-04-30 04:57:04.745472+00	2026-04-30 04:57:04.745472+00
bf7f90cd-cc3c-4762-be14-ba584c9f46da	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-08	DRAFT	f	\N	2026-04-30 04:58:28.297982+00	2026-04-30 04:58:28.297982+00
c99f2a5a-211e-41ee-a785-bcd39fb70707	8542caa8-697c-4064-a45b-fc8fd3ae2732	2026-04-14	DRAFT	f	\N	2026-04-30 05:01:18.242375+00	2026-04-30 05:01:18.242375+00
675b0031-3f10-4dde-827a-2aa9cd5cc1a8	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-12	DRAFT	f	\N	2026-05-14 06:16:54.684517+00	2026-05-14 06:16:54.684517+00
b2c1cf59-92ef-4ec4-aba0-71a7ba6334c3	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-18	DRAFT	f	\N	2026-05-18 05:02:47.364319+00	2026-05-18 05:02:47.364319+00
b1cf2c7f-144c-49ee-bc53-387890e6a06f	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-06	DRAFT	f	\N	2026-05-07 04:46:12.7417+00	2026-05-07 04:46:48.551+00
d7e45b83-0b3c-43b4-8f21-9ce6cd493923	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-01	DRAFT	f	\N	2026-05-05 07:29:04.309493+00	2026-05-05 09:29:32.826+00
5ae78af0-74de-4feb-8451-bed78b9c9b18	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-04	DRAFT	f	\N	2026-05-05 07:33:54.847282+00	2026-05-05 09:29:44.513+00
09b36f96-598e-47be-b29c-24ad176c41f2	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-07	DRAFT	f	\N	2026-05-07 04:32:44.35209+00	2026-05-07 04:47:09.248+00
218ad099-fced-4437-b061-635f7043f0d6	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-01	DRAFT	f	\N	2026-05-07 06:11:51.56509+00	2026-05-07 06:11:51.56509+00
f315545f-ce84-4047-9fac-6cb57d4f3639	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-04	DRAFT	f	\N	2026-05-07 06:12:29.457982+00	2026-05-07 06:12:29.457982+00
3f7b32bc-d52e-4655-8274-720322c8e6f3	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-01	DRAFT	f	\N	2026-05-05 10:30:07.412797+00	2026-05-05 10:30:07.412797+00
189a2e69-9e51-48ab-91c1-c2bfa9eaf28b	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-04	DRAFT	f	\N	2026-05-05 10:25:52.40571+00	2026-05-05 10:31:19.22+00
c830e61d-6093-4707-ae96-b8d55a4cdc62	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-01	DRAFT	f	\N	2026-05-05 10:28:51.382444+00	2026-05-05 10:31:36.054+00
8fda20a8-5e07-43f7-a974-765e43e7c904	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-04	DRAFT	f	\N	2026-05-05 10:33:50.277469+00	2026-05-05 10:35:04.971+00
46fbeb04-cc6e-404c-b50d-5be823417f2f	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-05	DRAFT	f	\N	2026-05-05 10:36:32.157274+00	2026-05-05 10:36:32.157274+00
d8853e28-986a-44c3-90b0-b61c5ccb20b8	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-05	DRAFT	f	\N	2026-05-05 10:37:24.143275+00	2026-05-05 10:37:24.143275+00
6499ee5c-4851-4ab4-9ac3-3f3177ef2c06	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-05	DRAFT	f	\N	2026-05-07 06:12:52.978361+00	2026-05-07 06:12:52.978361+00
b48e109a-6283-4834-9e7c-eab5c330f580	50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	2026-05-06	DRAFT	f	\N	2026-05-07 06:13:13.257609+00	2026-05-07 06:13:13.257609+00
0b9af7c1-cdcc-4184-b7be-6fa24dfe7cd6	448b84b7-13a1-43fe-a9de-39c5fcf9d95e	2026-05-06	DRAFT	t	MANUAL	2026-05-07 06:30:14.149153+00	2026-05-07 06:30:14.146+00
6d21f991-87ec-43bb-abb7-7e597d0513e6	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-05	DRAFT	f	\N	2026-05-05 07:39:30.153764+00	2026-05-06 05:19:09.441+00
e663098e-b617-4b5d-be93-ddfcdf6669d1	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-01	DRAFT	f	\N	2026-05-06 06:24:59.547492+00	2026-05-06 06:24:59.547492+00
2c7040e8-85ac-464b-8341-57a55c78eeeb	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-06	DRAFT	f	\N	2026-05-06 07:07:21.054804+00	2026-05-07 06:42:14.108+00
237e3013-f548-4e04-8be6-92061ec83aaa	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-07	DRAFT	f	\N	2026-05-07 07:24:17.750046+00	2026-05-07 07:24:17.750046+00
1a40565a-9eda-4a5a-85df-ee238853a174	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-04	DRAFT	f	\N	2026-05-06 06:25:17.214718+00	2026-05-06 06:28:40.758+00
2ca25900-100c-40b9-8844-e56fcb6b2929	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-05	DRAFT	f	\N	2026-05-06 06:29:44.675186+00	2026-05-06 06:34:40.432+00
48d62f02-f643-449a-9a89-ed1492753830	bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	2026-05-06	DRAFT	f	\N	2026-05-06 06:36:28.555547+00	2026-05-06 06:36:28.555547+00
64c6fa55-ea19-4db2-97ed-038e93073126	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-01	DRAFT	f	\N	2026-05-06 07:01:13.011139+00	2026-05-06 07:01:13.011139+00
41495cc7-433c-4ee8-b798-c57c2b6265b9	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-04	DRAFT	f	\N	2026-05-06 07:04:44.182744+00	2026-05-06 07:04:44.182744+00
cd7e890c-4ff5-4921-a53e-4787c8c8e835	f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	2026-05-06	DRAFT	f	\N	2026-05-06 08:16:55.872065+00	2026-05-06 08:16:55.872065+00
3aa7ad5f-4daf-4806-a15d-6a55d534f17b	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-05	DRAFT	f	\N	2026-05-05 08:35:50.334369+00	2026-05-06 17:01:57.859+00
605e10e6-9288-4deb-bc92-f3622f54baf4	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-07	DRAFT	f	\N	2026-05-07 13:58:51.802477+00	2026-05-07 14:01:21.359+00
14decc78-84cf-4e13-92dd-d360d84bb1b8	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-07	DRAFT	f	\N	2026-05-08 03:35:08.51611+00	2026-05-08 03:35:08.51611+00
41be6938-a806-4d9c-9923-f725f532efbf	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-06	DRAFT	f	\N	2026-05-06 04:59:53.793814+00	2026-05-06 17:12:19.692+00
47894fe1-3907-4953-81bb-7c4aeb3514c0	7378db3c-09c2-46f8-b28a-a8a1e86f8822	2026-05-08	DRAFT	f	\N	2026-05-08 04:27:02.629037+00	2026-05-08 04:28:33.651+00
28aea1fd-008b-40fd-b80f-bb68eba0c910	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-05	DRAFT	f	\N	2026-05-08 04:44:21.494724+00	2026-05-08 04:44:21.494724+00
a5022484-2036-4d35-9a3a-9f7b7923059d	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-06	DRAFT	f	\N	2026-05-06 05:15:40.849853+00	2026-05-07 04:29:11.025+00
62a70d8c-eb66-4b8b-9c7d-41689c170fbb	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-07	DRAFT	f	\N	2026-05-08 04:44:56.115829+00	2026-05-08 04:44:56.115829+00
c4d9ccd4-bd38-4a95-8d47-cf9e316c0bc7	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-06	DRAFT	t	MANUAL	2026-05-08 05:55:58.431045+00	2026-05-08 05:55:58.427+00
a5d0af74-8061-4077-94f2-ca9528c43d22	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-13	DRAFT	f	\N	2026-05-14 06:19:03.838243+00	2026-05-14 06:21:44.164+00
4c7b19fe-f4ac-4d55-945f-73f803ae3313	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-04	DRAFT	f	\N	2026-05-08 05:59:49.022484+00	2026-05-08 05:59:49.022484+00
cc242834-6e7a-4ad1-87e0-333a86f32af8	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-04-28	DRAFT	f	\N	2026-05-07 04:38:02.488743+00	2026-05-07 04:38:22.708+00
93b9dbf0-3186-4f25-816f-4c8973676ddf	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-04-29	DRAFT	f	\N	2026-05-07 04:36:55.451675+00	2026-05-07 04:38:34.71+00
ad13e80a-ead0-47f1-a0a6-98ff8df5b334	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-01	DRAFT	f	\N	2026-05-07 04:42:13.220818+00	2026-05-07 04:42:13.220818+00
d76f1fec-a1c6-412c-9513-4a7e26e6ea7f	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-05	DRAFT	f	\N	2026-05-08 06:10:04.786128+00	2026-05-08 06:17:52.413+00
8a37037c-1176-4f87-b4ba-1c70bf954f86	4f980d85-4b3f-45d3-8163-4dad2e229146	2026-05-07	DRAFT	f	\N	2026-05-08 06:22:44.068688+00	2026-05-08 06:22:44.068688+00
b5770376-6bd8-448e-aaf2-8af9319fb94c	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-11	DRAFT	f	\N	2026-05-11 11:25:27.724858+00	2026-05-11 11:26:05.526+00
c7a96b89-6827-42c2-b5a6-38d872db868d	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-14	DRAFT	f	\N	2026-05-14 06:17:43.620701+00	2026-05-14 06:21:44.166+00
56bef6cc-64d8-4d79-bab4-b258278eb000	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-08	DRAFT	f	\N	2026-05-08 03:36:19.130281+00	2026-05-11 11:27:41.903+00
64453e23-7c30-41be-aa15-78ef1408b16a	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-11	DRAFT	t	MANUAL	2026-05-12 10:10:08.331947+00	2026-05-12 10:10:08.328+00
49d1c054-970e-479a-a272-2e1a69bdcc2e	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-08	DRAFT	f	\N	2026-05-12 10:11:27.081414+00	2026-05-12 10:13:27.098+00
9ccd0b94-3400-411c-8541-10301109763f	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-12	DRAFT	f	\N	2026-05-12 10:15:36.774312+00	2026-05-12 10:16:53.116+00
4a33bd23-fa72-4677-bd92-9e1b686e1ce7	edc8df9b-d12e-4108-8a63-a3eb02084015	2026-05-12	DRAFT	f	\N	2026-05-13 04:15:21.931141+00	2026-05-13 04:15:21.931141+00
746e2341-378c-45d9-879e-c021860d7f0f	55f65491-5988-4d63-928c-ad873d9fa687	2026-05-12	DRAFT	f	\N	2026-05-13 04:45:44.177195+00	2026-05-13 04:45:44.177195+00
105592ae-eb14-4dd8-b1b4-d99cd5dcd098	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-08	DRAFT	f	\N	2026-05-14 06:04:19.008531+00	2026-05-14 06:04:19.008531+00
96dfa658-2dff-4197-bdab-a1bbf99122da	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-11	DRAFT	f	\N	2026-05-14 06:04:59.649841+00	2026-05-14 06:04:59.649841+00
7facbfcc-863c-4c78-8476-ad41f72c9bde	60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	2026-05-12	DRAFT	f	\N	2026-05-14 06:05:35.933427+00	2026-05-14 06:05:35.933427+00
2d5c5d8e-f90a-4583-a5f1-3a9b030b6c27	2fb73234-3d7f-4c1a-a868-c35bb94a8f88	2026-05-14	DRAFT	f	\N	2026-05-15 04:12:49.043757+00	2026-05-15 04:12:49.043757+00
8bf4faaf-3ab2-4806-b90a-958ea40f52f4	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-13	DRAFT	f	\N	2026-05-15 16:57:14.335523+00	2026-05-15 16:58:14.873+00
fe2197e7-9e38-4621-9d03-dd011ee72010	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-14	DRAFT	f	\N	2026-05-15 16:59:33.315628+00	2026-05-15 17:00:28.845+00
3b9ed553-cd60-417d-ae0a-71c742067755	1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	2026-05-15	DRAFT	f	\N	2026-05-15 17:02:06.889959+00	2026-05-15 17:05:22.093+00
ba3bb3cd-2a25-48f4-a1bc-88fc825c5fbf	244865e0-bd63-4df2-bab6-bfb1cd2799e3	2026-05-04	DRAFT	f	\N	2026-05-18 04:57:03.998818+00	2026-05-18 04:57:03.998818+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: time_sheet_user
--

COPY public.users (id, first_name, last_name, email, dob, gender, profile_pic, password, role_id, is_active, tfa_enabled, created_at, updated_at, deleted_at) FROM stdin;
5acb01b5-d00d-4257-8b28-39dff153d9c6	prince	sah	prince.rjb839@gmail.com	2026-04-08	female	http://localhost:5000/uploads/default-user.avif	\N	\N	t	f	2026-04-20 09:11:34.529996+00	2026-04-24 05:02:00.957+00	2026-04-24 05:02:00.957+00
7c5a9937-2917-4d69-8a37-28205611bede	Abhay	Munj	abhaymunj.20@gmail.com	1996-03-20	male	http://localhost:5000/uploads/default-user.avif	\N	\N	t	f	2026-04-24 04:37:42.146237+00	2026-04-24 05:07:22.376+00	2026-04-24 05:07:22.376+00
8542caa8-697c-4064-a45b-fc8fd3ae2732	Banti	Guleria	banti.guleria@idsil.com	1988-12-17	male	http://localhost:5000/uploads/default-user.avif	$2a$10$uX6R/MrAdNK9cGAxakTgE.iKzhiYHOcJvefZSgrfGZUzRYR1KpBL.	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	t	f	2026-04-24 05:07:39.944574+00	2026-04-28 05:06:06.372+00	\N
05e8fadc-6037-48ec-8b55-bf87346c431e	Admin	User	admin@idsil.com	2000-02-02	male	http://localhost:5000/uploads/default-user.avif	$2a$10$.auN1BM/wjJH1VCXqChsaeszJ3YngHV4S82UlkntrXlvFeI9hIBJO	6ed99788-b067-4da9-be01-bb455a02f6bb	t	f	2026-04-28 05:01:26.049953+00	2026-04-28 05:01:26.145+00	\N
448b84b7-13a1-43fe-a9de-39c5fcf9d95e	Anubhav	Rana	anubhav.r@idsil.com	1997-09-14	male	http://localhost:5000/uploads/default-user.avif	$2a$10$eT00KExTcFjMXny//Uc/te06PN.9sPSKn9F0iLiuv/qo5ZoM4MGIW	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 05:27:10.151025+00	2026-05-05 10:42:02.441+00	\N
f63c91c3-a4fa-4467-a2d6-af128a176eed	Umesh	kumar	umesh.kumar@idsil.com	1995-01-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$HqwOFbI31H0NqhgjslJfbePPiEvdlR3.1D8dVzrdzupXGWG4p4BvS	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-28 06:11:58.221969+00	2026-04-28 06:11:58.221969+00	\N
7378db3c-09c2-46f8-b28a-a8a1e86f8822	Sumit	Gupta	sumit.g@idsil.com	1940-09-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$JKje1qCop6EUOr4bg.jBRO0Ub/sVccXu3i9J7/E4YeYc4NAA8OpbK	3b45a62d-73fa-4fb6-bcf8-524f7bc5a645	t	f	2026-04-14 05:09:13.464155+00	2026-04-28 05:03:41.082+00	\N
59a2f8c6-0356-4749-8737-39c7d8946a57	Jaspal	Singh	jaspal.s@idsil.com	2004-04-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$iYXvEZY639r89B9aWp5hluivyVDisSL9kEx7jp4aA0bmAmOnF3QeS	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-17 06:23:33.734866+00	2026-04-28 05:03:53.589+00	\N
edc8df9b-d12e-4108-8a63-a3eb02084015	Sushil	Kumar	sushil.kumar1@idsil.com	1999-12-16	male	http://localhost:5000/uploads/default-user.avif	$2a$10$maSCoOBeILxsjuNy6GE6reHMZCAGrwe9pFzhNuxTaLQ9TP4FnClqa	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 04:31:16.475273+00	2026-04-28 05:04:03.791+00	\N
394ac45a-1f2d-4ea0-8bb6-1c02a7da17ce	Abhay	Munj	abhay.m@idsil.com	1996-03-20	male	http://localhost:5000/uploads/default-user.avif	$2a$10$uxQdBAWDpMgMCIoeuCdmB.D1mK/.RzL5SF8zFmWCabwoLcSlFskHm	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 04:38:21.325803+00	2026-04-28 05:04:18.426+00	\N
bbc22e4a-d673-4fe7-87d1-a6fafdb3a009	Ravi	Pal	ravi.p@idsil.com	2002-04-27	male	http://localhost:5000/uploads/default-user.avif	$2a$10$2v3ScpoH6grdwFeUbrI.AOjTLElpqgkACnIvzFO6PM307koWm1gWa	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 04:52:21.786462+00	2026-04-28 05:04:35.295+00	\N
f757db0e-c70a-4df7-bc7c-a2ca5cc1e76e	Kumar	Viswa	visvanathan.k@idsil.com	1991-05-23	male	http://localhost:5000/uploads/default-user.avif	$2a$10$57TGwGn7VVSC6S4JmEtMw.gQZ3HQBwW87hOE5hCJC.PzbsrmSvVTO	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-24 04:55:42.150671+00	2026-04-28 05:04:46.753+00	\N
2fb73234-3d7f-4c1a-a868-c35bb94a8f88	Shubham	Kumar	shubham.k@idsil.com	1989-11-27	male	http://localhost:5000/uploads/default-user.avif	$2a$10$YvaFIdarxHPe2CkHhp6dzufu3TDZcwOS.hkfFLzyLGzJpMLasbfNG	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-24 05:03:51.901693+00	2026-04-28 05:05:44.377+00	\N
4f980d85-4b3f-45d3-8163-4dad2e229146	Prabhjot	Singh	prabhjot.s@idsil.com	1990-01-01	male	/uploads/ab74909a-71e9-4ec8-b532-cce8bc5347ea.jpg	$2a$10$QZsc4RV5IqxSjb2PUvJrIemu1GoWLf7UU2IZk28W0sPAPKsO1bDM2	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	t	2026-04-14 05:02:05.16324+00	2026-04-30 04:47:20.09+00	\N
55f65491-5988-4d63-928c-ad873d9fa687	kiran	aryal	kiran.a@idsil.com	1998-06-18	male	http://localhost:5000/uploads/default-user.avif	$2a$10$N2kSVk8lRI/eDtaUEbZ/Eu45CjEL8ENMbgm1VOKb3DeXXlioe4/Pq	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 05:24:12.979815+00	2026-04-28 05:07:02.724+00	\N
60f8c9e8-f887-4e39-b2ee-f4cd4f6ba513	harish	sharma	harish.s@idsil.com	1997-04-02	male	http://localhost:5000/uploads/default-user.avif	$2a$10$ifGrW2I5g91SH0hkqxmFY..eXDLdMOZZ6Z8HPADVokw.xbafkjFT.	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 05:25:02.606222+00	2026-04-28 05:07:31.648+00	\N
7ba37884-75de-41db-b75a-5109880277a7	Sourabh	Kumar	sourabhids@gmail.com	2026-04-18	male	http://localhost:5000/uploads/default-user.avif	$2a$10$GBPmr5Wa.s4DxkUnWv6POu.CA0.v0GDOx1Je/ClTSP/5jAMq/kuIa	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 08:53:16.508079+00	2026-04-28 05:07:51.002+00	\N
244865e0-bd63-4df2-bab6-bfb1cd2799e3	Gaurav	Dhiman	gaurav.d@idsil.com	1994-09-17	male	http://localhost:5000/uploads/default-user.avif	$2a$10$sBTX7qNdT8.rN/pmADCFaObw3V3kJh/jTmYdGRGUzV4f6eY07dxLi	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-24 06:29:10.70975+00	2026-04-28 05:08:00.377+00	\N
50a7c9d5-3f96-4ac9-a81a-183b2fa65ed1	Hitender	Kumar	hitender.k@idsil.com	1991-11-18	male	http://localhost:5000/uploads/default-user.avif	$2a$10$VxF/ejthtZ4YstjA7Vfbq.SCrAqPGN5krTuDxY.Yl0bqIDyrqMrx.	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-24 06:25:27.032911+00	2026-04-28 05:08:13.678+00	\N
db5035c0-8ff3-486e-8a7b-ba77a09c1a78	Navjot	Singh	navjot.s@idsil.com	1998-04-15	male	http://localhost:5000/uploads/default-user.avif	$2a$10$tk0BypcAiauiBM1te0X1aeSmsrN6lwB6JSXZzFQ7kFtcHg5aW47xm	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-24 05:55:44.679701+00	2026-04-28 05:08:24.63+00	\N
099e363c-74b5-4d8c-bb50-6e43d58235c0	Sumit	Singh	sumit.singh@idsil.com	2001-06-13	male	http://localhost:5000/uploads/default-user.avif	\N	\N	t	f	2026-05-18 04:40:56.856923+00	2026-05-18 04:40:56.856923+00	\N
085c53f6-2872-4c00-b3e3-6e93b9fb16ba	Shubham	Gunvanta	shubham.g@idsil.com	2000-01-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$lRhb7ZPJDm0XAnyqFBEqy.cHcEiDwtKKJQ9Cdx4U3zxKvKNJu6jJy	f0fbe2f4-1d41-4b1a-b518-4f77392ec2f8	t	f	2026-04-28 06:13:16.247555+00	2026-05-05 06:41:06.107+00	\N
1bf4481d-c5c3-4fa3-ab2b-107bd3ee36c0	Lakshman	Praveen	lakshman.p@idsil.com	2000-01-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$52qrhYyhOv.fo0phaiy2OuHhH9PENvmAAaQ4QFk9jsiUmqVwDnsKi	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-28 06:14:41.367909+00	2026-04-28 06:14:41.367909+00	\N
a559faec-6ba3-4459-81b0-748686373bbc	Deepak	Bisht	deepak.k@idsil.com	2000-01-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$jAFjb.zWJbvH/GeoVzXQwu9PnTGYzXOKiSXPmS6M1rXmeoefjRLOC	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-28 06:16:04.836667+00	2026-04-28 06:16:04.836667+00	\N
acd78675-ae69-4308-97d5-1b23f8f2a15b	Harish	Sharma	harish.s@chemwatch.net	1998-10-24	male	http://localhost:5000/uploads/default-user.avif	$2a$10$oEaS8NRPREbN/agHnnE/Wu6HzqHnTY./A.EtOkCn7O0BTJ/wO.pQu	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-24 05:06:04.990086+00	2026-04-28 06:16:40.121+00	2026-04-28 06:16:40.121+00
32b4295b-7776-4398-b60c-9f91b078bbb8	Bhinder	Singh	bhinder.s@idsil.com	1990-01-01	male	http://localhost:5000/uploads/default-user.avif	$2a$10$AonCkJKKLlDy9t2aoJi1a.ShBg4ms/aoScnt/oz56dSspERXZ0N7K	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-28 06:18:14.701944+00	2026-04-28 06:18:14.701944+00	\N
e219e6a1-91c8-4183-8d7c-ed51e992c438	Prince	Shah	prince.s@idsil.com	2003-09-02	male	http://localhost:5000/uploads/default-user.avif	$2a$10$dXuDORbOwEJ6eQHSf.utiOCtSbxXAUObfECaiYLYB0TXXOsuYddwK	a1b7527a-c923-498f-89a9-5a7667dee311	t	f	2026-04-14 05:08:17.290171+00	2026-04-28 06:18:27.271+00	\N
6b38dbc1-85cd-4249-aa9f-0aaa4f879605	Saniya	Aggarwal	saniya.aggarwal@idsil.com	2001-12-06	female	http://localhost:5000/uploads/default-user.avif	$2a$10$T0eoFsv0NmoNXF8VGzuMOeZvKfM5Imo1Q8EceR3PbjYUKqtETqh3e	85f42bb4-e517-436c-a44f-3367a9bb35a2	t	f	2026-04-28 06:23:50.355815+00	2026-04-28 11:28:02.747+00	\N
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: time_sheet_user
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: time_sheet_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_key_unique; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_key_unique UNIQUE (key);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_project_code_unique; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_code_unique UNIQUE (project_code);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: task_assignment_events task_assignment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.task_assignment_events
    ADD CONSTRAINT task_assignment_events_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_logs time_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_pkey PRIMARY KEY (id);


--
-- Name: timesheet_exports timesheet_exports_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.timesheet_exports
    ADD CONSTRAINT timesheet_exports_pkey PRIMARY KEY (id);


--
-- Name: timesheet_exports timesheet_exports_token_unique; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.timesheet_exports
    ADD CONSTRAINT timesheet_exports_token_unique UNIQUE (token);


--
-- Name: timesheet_statuses timesheet_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.timesheet_statuses
    ADD CONSTRAINT timesheet_statuses_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: clients_deleted_at_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX clients_deleted_at_idx ON public.clients USING btree (deleted_at);


--
-- Name: clients_email_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX clients_email_idx ON public.clients USING btree (email);


--
-- Name: notifications_user_created_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX notifications_user_created_idx ON public.notifications USING btree (user_id, created_at);


--
-- Name: notifications_user_read_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX notifications_user_read_idx ON public.notifications USING btree (user_id, is_read);


--
-- Name: project_members_project_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX project_members_project_idx ON public.project_members USING btree (project_id);


--
-- Name: project_members_project_user_unique; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE UNIQUE INDEX project_members_project_user_unique ON public.project_members USING btree (project_id, user_id);


--
-- Name: project_members_user_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX project_members_user_idx ON public.project_members USING btree (user_id);


--
-- Name: projects_client_id_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX projects_client_id_idx ON public.projects USING btree (client_id);


--
-- Name: projects_created_by_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX projects_created_by_idx ON public.projects USING btree (created_by);


--
-- Name: projects_deleted_at_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX projects_deleted_at_idx ON public.projects USING btree (deleted_at);


--
-- Name: projects_project_manager_id_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX projects_project_manager_id_idx ON public.projects USING btree (project_manager_id);


--
-- Name: task_assignment_events_changed_at_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX task_assignment_events_changed_at_idx ON public.task_assignment_events USING btree (changed_at);


--
-- Name: task_assignment_events_task_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX task_assignment_events_task_idx ON public.task_assignment_events USING btree (task_id);


--
-- Name: tasks_assigned_to_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX tasks_assigned_to_idx ON public.tasks USING btree (assigned_to);


--
-- Name: tasks_assigned_to_status_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX tasks_assigned_to_status_idx ON public.tasks USING btree (assigned_to, status);


--
-- Name: tasks_deleted_at_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX tasks_deleted_at_idx ON public.tasks USING btree (deleted_at);


--
-- Name: tasks_project_id_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX tasks_project_id_idx ON public.tasks USING btree (project_id);


--
-- Name: tasks_project_status_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX tasks_project_status_idx ON public.tasks USING btree (project_id, status);


--
-- Name: tasks_status_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);


--
-- Name: time_logs_project_date_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX time_logs_project_date_idx ON public.time_logs USING btree (project_id, date);


--
-- Name: time_logs_task_date_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX time_logs_task_date_idx ON public.time_logs USING btree (task_id, date);


--
-- Name: time_logs_user_date_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX time_logs_user_date_idx ON public.time_logs USING btree (user_id, date);


--
-- Name: timesheet_exports_created_by_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX timesheet_exports_created_by_idx ON public.timesheet_exports USING btree (created_by);


--
-- Name: timesheet_exports_expires_at_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX timesheet_exports_expires_at_idx ON public.timesheet_exports USING btree (expires_at);


--
-- Name: timesheet_statuses_user_date_unique; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE UNIQUE INDEX timesheet_statuses_user_date_unique ON public.timesheet_statuses USING btree (user_id, date);


--
-- Name: timesheet_statuses_user_idx; Type: INDEX; Schema: public; Owner: time_sheet_user
--

CREATE INDEX timesheet_statuses_user_idx ON public.timesheet_statuses USING btree (user_id);


--
-- Name: clients clients_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: projects projects_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: projects projects_project_manager_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_manager_id_users_id_fk FOREIGN KEY (project_manager_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: task_assignment_events task_assignment_events_changed_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.task_assignment_events
    ADD CONSTRAINT task_assignment_events_changed_by_user_id_users_id_fk FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: task_assignment_events task_assignment_events_from_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.task_assignment_events
    ADD CONSTRAINT task_assignment_events_from_user_id_users_id_fk FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: task_assignment_events task_assignment_events_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.task_assignment_events
    ADD CONSTRAINT task_assignment_events_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_assignment_events task_assignment_events_to_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.task_assignment_events
    ADD CONSTRAINT task_assignment_events_to_user_id_users_id_fk FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: tasks tasks_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: time_logs time_logs_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: time_logs time_logs_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: time_logs time_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: timesheet_exports timesheet_exports_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.timesheet_exports
    ADD CONSTRAINT timesheet_exports_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: timesheet_statuses timesheet_statuses_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.timesheet_statuses
    ADD CONSTRAINT timesheet_statuses_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: time_sheet_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict s0WeeAxi5yMzrlFKlMYlTkuGLfdf7MaM588epWk8jet7b30Re6zwavTPg7FHg0B

