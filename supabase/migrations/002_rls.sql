alter table public.users enable row level security;
alter table public.trip_plans enable row level security;
alter table public.poi_items enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.messages enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.posts enable row level security;
alter table public.match_applications enable row level security;
alter table public.match_confirmations enable row level security;
alter table public.reviews enable row level security;

create policy "public profiles readable" on public.users for select using (true);
create policy "user updates self" on public.users for update using (auth.uid() = id);
create policy "trip owner full access" on public.trip_plans for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "public trips readable" on public.trip_plans for select using (visibility = 'public');
create policy "public poi readable" on public.poi_items for select using (exists(select 1 from public.trip_plans t where t.id=trip_plan_id and (t.visibility='public' or t.owner_id=auth.uid())));
create policy "trip owner edits poi" on public.poi_items for all using (exists(select 1 from public.trip_plans t where t.id=trip_plan_id and t.owner_id=auth.uid()));
create policy "public posts readable" on public.posts for select using (visibility='public' or author_id=auth.uid());
create policy "author manages posts" on public.posts for all using (author_id=auth.uid()) with check(author_id=auth.uid());

create function public.is_group_member(target_group uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.group_members gm where gm.group_id=target_group and gm.user_id=auth.uid());
$$;
create policy "members read groups" on public.groups for select using (public.is_group_member(id));
create policy "members read roster" on public.group_members for select using (public.is_group_member(group_id));
create policy "members read messages" on public.messages for select using (public.is_group_member(group_id));
create policy "members send messages" on public.messages for insert with check (sender_id=auth.uid() and public.is_group_member(group_id));
create policy "members read expenses" on public.expenses for select using (public.is_group_member(group_id));
create policy "members add expenses" on public.expenses for insert with check (payer_id=auth.uid() and public.is_group_member(group_id));
create policy "members read splits" on public.expense_splits for select using (exists(select 1 from public.expenses e where e.id=expense_id and public.is_group_member(e.group_id)));
create policy "participants read applications" on public.match_applications for select using (auth.uid() in (applicant_id,owner_id));
create policy "applicant creates application" on public.match_applications for insert with check (auth.uid()=applicant_id and applicant_id<>owner_id);
create policy "participants update applications" on public.match_applications for update using (auth.uid() in (applicant_id,owner_id));
create policy "participants confirm" on public.match_confirmations for insert with check (auth.uid()=user_id and exists(select 1 from public.match_applications a where a.id=application_id and auth.uid() in (a.applicant_id,a.owner_id)));
create policy "participants read confirmations" on public.match_confirmations for select using (exists(select 1 from public.match_applications a where a.id=application_id and auth.uid() in (a.applicant_id,a.owner_id)));
create policy "reviews readable" on public.reviews for select using (true);
create policy "author creates review" on public.reviews for insert with check(auth.uid()=author_id);

-- 小组创建必须在服务端事务中验证：application accepted 且 applicant/owner 两人均存在 match_confirmations。
-- MVP 身份认证、SOS 与支付均为 UI mock；V2 接入真实服务后需增加审计日志与服务端授权。
