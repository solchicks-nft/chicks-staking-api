create or replace function summary_stake_flex(param_offset int, param_limit int)
returns table(address varchar, sum_amount varchar, sum_x_amount varchar)
as $$
select
  address,
  sum(amount) as sum_amount,
  sum(x_token) as sum_x_amount
from stake_flex
where status = 0
group by address
limit param_limit offset param_offset;
$$ language sql;
